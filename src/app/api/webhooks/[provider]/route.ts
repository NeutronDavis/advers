import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/server/payments";
import { processProviderEvent } from "@/server/payments/processing";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider: providerSlug } = await context.params;

  let provider;
  try {
    provider = getPaymentProvider(providerSlug);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown provider." },
      { status: 404 }
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > 256_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  if (!provider.verifyWebhook(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event;
  try {
    event = provider.parseWebhook(rawBody);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload." },
      { status: 400 }
    );
  }

  let stored;
  try {
    stored = await prisma.providerEvent.create({
      data: {
        provider: provider.name,
        eventId: event.eventId,
        type: event.type,
        payloadJson: rawBody,
        signatureValid: true,
        status: "RECEIVED",
        attempts: 1,
        lastAttemptAt: new Date(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      stored = await prisma.providerEvent.findUnique({
        where: {
          provider_eventId: {
            provider: provider.name,
            eventId: event.eventId,
          },
        },
      });
      if (stored && (stored.status === "PROCESSED" || stored.status === "IGNORED")) {
        return NextResponse.json({ received: true, duplicate: true });
      }
    } else {
      throw error;
    }
  }

  if (!stored) {
    return NextResponse.json({ error: "Could not persist event." }, { status: 500 });
  }

  await prisma.providerEvent.update({
    where: { id: stored.id },
    data: {
      attempts: { increment: stored.status === "RECEIVED" ? 0 : 1 },
      lastAttemptAt: new Date(),
    },
  });

  try {
    const result = await processProviderEvent(event);
    await prisma.providerEvent.update({
      where: { id: stored.id },
      data: {
        status: result.ignored ? "IGNORED" : "PROCESSED",
        processedAt: new Date(),
        error: null,
      },
    });
    return NextResponse.json({
      received: true,
      processed: result.processed,
      ignored: result.ignored,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed.";
    await prisma.providerEvent.update({
      where: { id: stored.id },
      data: {
        status: "FAILED",
        processedAt: new Date(),
        lastAttemptAt: new Date(),
        error: message,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

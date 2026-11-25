import React from "react";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/server/payments";
import MockCheckoutClient from "./MockCheckoutClient";

export const dynamic = "force-dynamic";

export default async function MockCheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const session = await requireUser();

  const transaction = await prisma.walletTransaction.findUnique({
    where: { reference },
    include: { wallet: true },
  });

  if (!transaction || transaction.wallet.userId !== session.id) {
    notFound();
  }
  if (transaction.status === "SUCCESS") {
    redirect("/portal/wallet");
  }

  let providerName = "mock";
  try {
    providerName = getPaymentProvider().name;
  } catch {
    providerName = "unavailable";
  }

  return (
    <MockCheckoutClient
      reference={transaction.reference}
      description={transaction.description}
      amountMinor={(transaction.amountMinor ?? BigInt(0)).toString()}
      currency={transaction.currency}
      network={transaction.network}
      status={transaction.status}
      providerName={providerName}
    />
  );
}

import React from "react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import InboxClient, { DatabaseFeedbackDTO } from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  await requireStaff();

  // Query actual Feedback & Inquiry database items directly via Prisma
  const feedbackItems = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  const initialInquiries: DatabaseFeedbackDTO[] = feedbackItems.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    company: item.company,
    type: item.type,
    status: item.status,
    message: item.message,
    packageInterest: item.packageInterest,
    source: item.source,
    internalNote: item.internalNote,
    createdAt: item.createdAt.toISOString(),
  }));

  return <InboxClient initialInquiries={initialInquiries} />;
}

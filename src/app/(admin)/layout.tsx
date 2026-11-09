import React from "react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  const unreadInboxCount = await prisma.feedback.count({
    where: { status: "NEW" },
  });

  return (
    <AdminShell user={user} unreadInboxCount={unreadInboxCount}>
      {children}
    </AdminShell>
  );
}

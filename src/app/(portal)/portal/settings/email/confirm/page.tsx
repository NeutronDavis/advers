import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { confirmEmailChangeToken } from "@/server/actions/account";

export const dynamic = "force-dynamic";

export default async function ConfirmEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await requireUser();
  const { token } = await searchParams;
  const result = token
    ? await confirmEmailChangeToken(token)
    : { success: false as const, error: "Verification token is missing." };

  return (
    <div className="mx-auto w-full max-w-lg space-y-5">
      <div className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)]">
            <Mail className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-extrabold text-[var(--portal-ink)]">
            Confirm email change
          </h1>
        </div>

        {result.success ? (
          <div className="mt-5 alert alert-success text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>{result.message ?? "Email address updated."}</span>
          </div>
        ) : (
          <div className="mt-5 alert alert-error text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{result.error}</span>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Link href="/portal/settings" className="btn btn-primary btn-sm">
            Back to settings
          </Link>
        </div>
      </div>
    </div>
  );
}

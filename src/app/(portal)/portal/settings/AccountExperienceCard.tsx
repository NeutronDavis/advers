"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Loader2, Sparkles, UserCircle } from "lucide-react";
import { switchAccountContextAction } from "@/server/actions/account";

export default function AccountExperienceCard({
  context,
  hasClient,
  hasBooster,
  boosterHandle,
}: {
  context: "USER" | "BOOSTER" | "ADMIN";
  hasClient: boolean;
  hasBooster: boolean;
  boosterHandle: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const switchTo = (target: "USER" | "BOOSTER") => {
    setError(null);
    startTransition(async () => {
      const result = await switchAccountContextAction(target);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(result.redirectTo);
      router.refresh();
    });
  };

  return (
    <section className="rounded-3xl border border-[var(--portal-line)] bg-[var(--portal-surface)] p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)]">
          <ArrowLeftRight className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            Account experience
          </h2>
          <p className="text-[11px] text-[var(--portal-muted)]">
            One login, separate advertiser and AdBooster workspaces.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="badge badge-primary badge-sm">
          Current: {context === "BOOSTER" ? "AdBooster" : context === "ADMIN" ? "Admin" : "Advertiser"}
        </span>
        {hasClient && <span className="badge badge-ghost badge-sm">Advertiser account</span>}
        {hasBooster && <span className="badge badge-ghost badge-sm">AdBooster account</span>}
      </div>

      {error && <div className="alert alert-error text-xs">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {context === "USER" && hasBooster && (
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => switchTo("BOOSTER")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Switch to AdBooster
          </button>
        )}
        {context === "BOOSTER" && hasClient && (
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => switchTo("USER")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCircle className="h-4 w-4" />}
            Switch to Advertiser
          </button>
        )}
        {context === "USER" && !hasBooster && (
          <Link href="/booster/profile/edit" className="btn btn-primary btn-sm rounded-xl">
            <Sparkles className="h-4 w-4" />
            Create AdBooster account
          </Link>
        )}
        {hasBooster && boosterHandle && (
          <Link
            href={`/portal/adboosters/${boosterHandle}`}
            className="btn btn-ghost btn-sm rounded-xl"
          >
            View public AdBooster profile
          </Link>
        )}
        {context === "ADMIN" && (
          <span className="text-[11px] text-[var(--portal-muted)]">
            Admin sessions cannot switch into a customer workspace.
          </span>
        )}
      </div>
    </section>
  );
}

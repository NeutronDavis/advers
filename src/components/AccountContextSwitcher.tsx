"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Loader2, Sparkles } from "lucide-react";
import { switchAccountContextAction } from "@/server/actions/account";
import type { AuthSessionUser } from "@/lib/types/dto";

export default function AccountContextSwitcher({
  user,
  className = "",
}: {
  user: AuthSessionUser;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (user.role === "ADMIN" || user.role === "STAFF") return null;

  const switchTo = (target: "USER" | "BOOSTER") => {
    startTransition(async () => {
      const result = await switchAccountContextAction(target);
      if (result.success) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  if (user.context === "BOOSTER" && user.clientId) {
    return (
      <button
        type="button"
        onClick={() => switchTo("USER")}
        disabled={isPending}
        className={`btn btn-ghost btn-xs justify-start gap-2 ${className}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowLeftRight className="h-3.5 w-3.5" />
        )}
        Switch to Advertiser
      </button>
    );
  }

  if (user.context === "USER" && user.boosterProfileId) {
    return (
      <button
        type="button"
        onClick={() => switchTo("BOOSTER")}
        disabled={isPending}
        className={`btn btn-ghost btn-xs justify-start gap-2 ${className}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowLeftRight className="h-3.5 w-3.5" />
        )}
        Switch to AdBooster
      </button>
    );
  }

  if (user.context === "USER" && !user.boosterProfileId) {
    return (
      <Link
        href="/booster/profile/edit"
        className={`btn btn-ghost btn-xs justify-start gap-2 ${className}`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Become an AdBooster
      </Link>
    );
  }

  return null;
}

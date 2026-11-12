import React from "react";
import Link from "next/link";
import { Edit3, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBoosterProfileForUser } from "@/server/data/booster";
import VerificationClient from "./VerificationClient";

export const dynamic = "force-dynamic";

export default async function BoosterVerificationPage() {
  const user = await requireUser();
  const profile = await getBoosterProfileForUser(user.id);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verification
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Create your Booster profile before submitting verification documents.
          </p>
        </div>
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold">Profile required</h2>
            <p className="text-xs text-base-content/60 mt-1 max-w-xl">
              We need your Booster profile details before we can review identity,
              business or portfolio documents.
            </p>
          </div>
          <Link
            href="/booster/profile/edit"
            className="btn btn-primary rounded-xl font-bold gap-2 self-start"
          >
            <Edit3 className="w-4 h-4" />
            Create profile
          </Link>
        </div>
      </div>
    );
  }

  return <VerificationClient profile={profile} />;
}

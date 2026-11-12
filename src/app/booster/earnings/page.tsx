import React from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBoosterFinanceData } from "@/server/data/finance";
import BoosterEarningsClient from "./BoosterEarningsClient";

export const dynamic = "force-dynamic";

export default async function BoosterEarningsPage() {
  const user = await requireUser();
  const data = await getBoosterFinanceData(user.id);

  if (!data) {
    return (
      <div className="card bg-base-100 border border-base-200 rounded-3xl p-10 text-center space-y-3">
        <h1 className="text-xl font-extrabold">Booster earnings</h1>
        <p className="text-xs text-base-content/60">
          Create your Booster profile to start earning from marketplace jobs.
        </p>
        <Link href="/booster/profile" className="btn btn-primary rounded-xl font-bold">
          Create Booster profile
        </Link>
      </div>
    );
  }

  return <BoosterEarningsClient data={data} />;
}

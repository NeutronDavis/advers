import React from "react";
import { requireUser } from "@/lib/auth";
import { getBoosterProfileForUser } from "@/server/data/booster";
import BoosterProfileForm from "./BoosterProfileForm";
import PortfolioMediaManager from "./PortfolioMediaManager";

export const dynamic = "force-dynamic";

export default async function BoosterProfileEditPage() {
  const user = await requireUser();
  const profile = await getBoosterProfileForUser(user.id);

  return (
    <div>
      <BoosterProfileForm userName={user.name} profile={profile} />
      <PortfolioMediaManager
        items={
          profile?.portfolioItems
            .filter((item) => item.mediaUrl)
            .map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              mediaUrl: item.mediaUrl,
            })) ?? []
        }
      />
    </div>
  );
}

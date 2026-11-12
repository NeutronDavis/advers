import React from "react";
import { requireUser } from "@/lib/auth";
import { getPublishedAdversPosts } from "@/server/data/posts";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  await requireUser();
  const posts = await getPublishedAdversPosts("DASHBOARD", 6);
  return <DashboardClient posts={posts} />;
}

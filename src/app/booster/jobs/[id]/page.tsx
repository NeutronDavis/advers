import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getBoosterJobDetail,
  getBoosterProfileForUser,
} from "@/server/data/booster";
import JobDetailClient from "./JobDetailClient";

export const dynamic = "force-dynamic";

export default async function BoosterJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [job, profile] = await Promise.all([
    getBoosterJobDetail(id, user.id),
    getBoosterProfileForUser(user.id),
  ]);

  if (!job) notFound();

  return <JobDetailClient job={job} hasProfile={Boolean(profile)} />;
}

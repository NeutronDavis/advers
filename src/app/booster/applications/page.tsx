import React from "react";
import { requireUser } from "@/lib/auth";
import {
  getBoosterApplicationsForUser,
  getBoosterAssignedJobsForUser,
  getBoosterProfileForUser,
} from "@/server/data/booster";
import ApplicationsClient from "./ApplicationsClient";

export const dynamic = "force-dynamic";

export default async function BoosterApplicationsPage() {
  const user = await requireUser();
  const [profile, applications, assignedJobs] = await Promise.all([
    getBoosterProfileForUser(user.id),
    getBoosterApplicationsForUser(user.id),
    getBoosterAssignedJobsForUser(user.id),
  ]);

  return (
    <ApplicationsClient
      hasProfile={Boolean(profile)}
      applications={applications}
      assignedJobs={assignedJobs}
    />
  );
}

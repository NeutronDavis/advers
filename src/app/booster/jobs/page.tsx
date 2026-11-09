import React from "react";
import { requireUser } from "@/lib/auth";
import {
  getBoosterApplicationsForUser,
  getBoosterProfileForUser,
  getOpenBoosterJobs,
} from "@/server/data/booster";
import JobsClient from "./JobsClient";

export const dynamic = "force-dynamic";

export default async function BoosterJobsPage() {
  const user = await requireUser();
  const [profile, jobs, applications] = await Promise.all([
    getBoosterProfileForUser(user.id),
    getOpenBoosterJobs(),
    getBoosterApplicationsForUser(user.id),
  ]);

  return (
    <JobsClient
      jobs={jobs}
      hasProfile={Boolean(profile)}
      appliedJobIds={applications.map((application) => application.jobId)}
    />
  );
}

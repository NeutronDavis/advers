import React from "react";
import { prisma } from "@/lib/prisma";
import ProjectsGrid, { DynamicProjectItem } from "./ProjectsGrid";

export const dynamic = "force-dynamic";

export default async function ClientProjectsPage() {
  // Query active client user & engagements from Prisma DB
  const clientUser = await prisma.user.findFirst({
    where: { role: "CLIENT" },
    include: {
      client: {
        include: {
          engagements: {
            include: {
              package: true,
            },
          },
          renewals: true,
        },
      },
    },
  });

  const engagements = clientUser?.client?.engagements || [];
  const renewals = clientUser?.client?.renewals || [];

  const initialProjects: DynamicProjectItem[] = engagements.map((eng) => {
    const isBillboard = eng.type === "BILLBOARD";
    const imageSrc = "/auth-showcase.jpg";

    return {
      id: eng.id,
      name: eng.package?.name || (isBillboard ? "Billboard Placement Slot" : "Digital Package Suite"),
      category: eng.type,
      packageTier: eng.package?.tagline || eng.type.replace(/_/g, " "),
      status: eng.status,
      progress: eng.onboardingProgress,
      image: imageSrc,
      deliveryOrRenewal: `Updated: ${new Date(eng.updatedAt).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      metrics: eng.waitingOnClient
        ? "Action Required: Waiting on Client Upload"
        : `${eng.onboardingProgress}% Onboarding Milestone Completed`,
      link: `/portal/onboarding/${eng.id}`,
    };
  });

  // Include active renewals as subscriptions
  renewals.forEach((ren) => {
    initialProjects.push({
      id: ren.id,
      name: ren.title,
      category: "CARE_PLAN",
      packageTier: "Annual Care Plan",
      status: ren.status,
      progress: 100,
      image: "/logo.png",
      deliveryOrRenewal: `Renewal Date: ${new Date(ren.renewalDate).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
      metrics: `Amount: ₦${ren.amount.toLocaleString("en-NG")}`,
      link: "/portal/settings",
    });
  });

  return <ProjectsGrid initialProjects={initialProjects} />;
}

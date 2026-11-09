import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  ClipboardList,
  Compass,
  Sparkles,
  Star,
  UserCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getBoosterApplicationsForUser,
  getBoosterAssignedJobsForUser,
  getBoosterProfileForUser,
  getNotificationsForUser,
  getOpenBoosterJobs,
} from "@/server/data/booster";
import { formatDate, formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BoosterDashboardPage() {
  const user = await requireUser();
  const [profile, openJobs, applications, assignedJobs, notifications] =
    await Promise.all([
      getBoosterProfileForUser(user.id),
      getOpenBoosterJobs(),
      getBoosterApplicationsForUser(user.id),
      getBoosterAssignedJobsForUser(user.id),
      getNotificationsForUser(user.id, 5),
    ]);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-8 shadow-3d text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Become an Advers Booster
          </h1>
          <p className="text-sm text-base-content/70 max-w-lg mx-auto">
            Earn by completing marketing work — creative, production, delivery,
            field marketing, intelligence, sales or technical services. Create
            your profile to start applying.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left max-w-xl mx-auto pt-2">
            {[
              "Choose your categories",
              "Set your coverage",
              "Add portfolio & rates",
              "Apply for jobs",
              "Submit proof",
              "Get reviewed & paid",
            ].map((item) => (
              <div
                key={item}
                className="p-3 rounded-xl bg-base-200/60 text-[11px] font-bold flex items-center gap-2"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/booster/profile"
            className="btn btn-primary rounded-xl font-bold gap-2"
          >
            Create Booster profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Open jobs",
      value: openJobs.length.toString(),
      subtext: "Published opportunities",
      icon: <Compass className="w-4 h-4" />,
      href: "/booster/jobs",
    },
    {
      label: "My applications",
      value: applications.length.toString(),
      subtext: "Applied and shortlisted",
      icon: <ClipboardList className="w-4 h-4" />,
      href: "/booster/applications",
    },
    {
      label: "Assigned jobs",
      value: assignedJobs.length.toString(),
      subtext: "Accepted and in progress",
      icon: <Briefcase className="w-4 h-4" />,
      href: "/booster/applications",
    },
    {
      label: "Completed jobs",
      value: profile.completedJobs.toString(),
      subtext: "Approved deliverables",
      icon: <BadgeCheck className="w-4 h-4" />,
      href: "/booster/profile",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {profile.displayName}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Your skills. Your network. Your resources. Your opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge badge-lg badge-success badge-soft font-bold">
            {profile.verificationLabel}
          </span>
          <Link
            href="/booster/profile"
            className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold gap-1.5"
          >
            <UserCircle className="w-4 h-4" />
            Edit profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between text-base-content/60 text-[11px] font-bold">
              <span>{stat.label}</span>
              <div className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight mt-2.5">
              {stat.value}
            </div>
            <div className="text-[10px] text-base-content/50 mt-0.5">
              {stat.subtext}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Assigned work
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Jobs assigned to you by Advers.
                </p>
              </div>
              <Link
                href="/booster/applications"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            {assignedJobs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-base-200/40 text-center text-xs text-base-content/60">
                No assigned jobs yet. Apply to open opportunities in the
                marketplace.
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                {assignedJobs.slice(0, 4).map((job) => (
                  <Link
                    key={job.id}
                    href={`/booster/jobs/${job.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-base-200/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{job.title}</div>
                      <div className="text-[10px] text-base-content/60">
                        {job.categoryLabel} · {job.location}
                        {job.deadline ? ` · due ${formatDate(job.deadline)}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold">
                        {formatNaira(job.budget)}
                      </span>
                      <span className={`badge badge-xs font-bold ${job.statusBadgeClass}`}>
                        {job.statusLabel}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  Recommended opportunities
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Open jobs matching the marketplace.
                </p>
              </div>
              <Link
                href="/booster/jobs"
                className="text-xs font-bold text-primary hover:underline"
              >
                Browse all →
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-base-200/40 text-center text-xs text-base-content/60">
                No open jobs right now. Check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {openJobs.slice(0, 4).map((job) => (
                  <Link
                    key={job.id}
                    href={`/booster/jobs/${job.id}`}
                    className="p-4 rounded-2xl border border-base-200 hover:border-primary/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-xs badge-primary badge-soft font-bold">
                        {job.categoryLabel}
                      </span>
                      <span className="text-[10px] text-base-content/50">
                        {job.isRemote ? "Remote" : job.location}
                      </span>
                    </div>
                    <div className="text-xs font-bold">{job.title}</div>
                    <div className="text-[10px] text-base-content/60 line-clamp-2">
                      {job.description}
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold">{formatNaira(job.budget)}</span>
                      <span className="text-base-content/50">{job.paymentModelLabel}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              Reputation
            </h2>
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/60">Rating</span>
              <span className="font-black">
                {profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "New"}
                {profile.ratingCount > 0 ? ` (${profile.ratingCount})` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/60">Completed jobs</span>
              <span className="font-black">{profile.completedJobs}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/60">Categories</span>
              <span className="font-bold text-right">
                {profile.categories.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.categories.map((category) => (
                <span
                  key={category}
                  className="badge badge-xs bg-base-200 border-none font-bold"
                >
                  {category.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notifications
              </h2>
              <Link
                href="/booster/notifications"
                className="text-[10px] font-bold text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {notifications.length === 0 ? (
              <div className="text-[11px] text-base-content/60 py-3 text-center">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2.5 rounded-xl text-[11px] ${
                      notification.readAt
                        ? "bg-base-200/40"
                        : "bg-primary/5 border border-primary/20"
                    }`}
                  >
                    <div className="font-bold">{notification.title}</div>
                    <div className="text-base-content/60 line-clamp-2">
                      {notification.body}
                    </div>
                    <div className="text-[9px] text-base-content/40 mt-1">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

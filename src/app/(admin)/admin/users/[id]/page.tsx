import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Phone,
  Shield,
  Clock,
  Briefcase,
  Receipt,
  FileText,
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  Key,
  UserX,
  UserCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminSession = await requireStaff();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          engagements: {
            include: { package: true },
          },
          invoices: true,
          activityLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    notFound();
  }

  const formatNaira = (val: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-base-content"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
                {user.name}
              </h1>
              <span
                className={`badge text-xs font-bold ${
                  user.status === "ACTIVE"
                    ? "badge-success text-white"
                    : user.status === "PROSPECT"
                    ? "badge-info text-white"
                    : user.status === "UNVERIFIED"
                    ? "badge-warning"
                    : "badge-error text-white"
                }`}
              >
                {user.status}
              </span>
            </div>
            <p className="text-xs text-base-content/60 font-medium">{user.email}</p>
          </div>
        </div>

        {/* Staff Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Read-only Impersonation Link */}
          <Link
            href={`/portal/dashboard?impersonate=${user.id}`}
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-10 px-3.5 border-none shadow-sm gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>View as Client</span>
          </Link>

          <button className="btn btn-outline border-base-300 text-xs font-bold rounded-xl h-10 px-3.5 gap-1.5">
            <Send className="w-3.5 h-3.5 text-primary" />
            <span>Resend Invite</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: User Info & Client Record */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Profile & Account Meta */}
        <div className="space-y-6">
          <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-base-200">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-base-content">{user.name}</h3>
                <span className="badge badge-primary text-[10px] font-bold">{user.role}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-base-content/70">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{user.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <Building className="w-4 h-4 text-primary shrink-0" />
                <span>{user.client?.name || "Independent Account"}</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Registered:{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-base-200 space-y-2">
              <div className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider">
                Acquisition Attribution
              </div>
              <div className="p-3 bg-base-200/50 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Source:</span>
                  <span className="font-bold text-base-content">{user.source || "WEBSITE"}</span>
                </div>
                {user.utmSource && (
                  <div className="flex justify-between">
                    <span className="text-base-content/60">UTM Source:</span>
                    <span className="font-bold text-base-content">{user.utmSource}</span>
                  </div>
                )}
                {user.utmCampaign && (
                  <div className="flex justify-between">
                    <span className="text-base-content/60">UTM Campaign:</span>
                    <span className="font-bold text-base-content">{user.utmCampaign}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Engagements, Invoices & Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Engagements Section */}
          <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
            <h3 className="text-base font-extrabold text-base-content flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span>Active Engagements &amp; Projects</span>
            </h3>

            {!user.client?.engagements || user.client.engagements.length === 0 ? (
              <div className="p-6 text-center bg-base-200/30 rounded-2xl text-xs text-base-content/60">
                No active service engagements created for this account yet.
              </div>
            ) : (
              <div className="space-y-3">
                {user.client.engagements.map((eng) => (
                  <div
                    key={eng.id}
                    className="p-4 rounded-2xl bg-base-200/40 border border-base-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary text-[10px] font-bold">
                          {eng.package?.name || eng.type}
                        </span>
                        <h4 className="text-xs font-extrabold text-base-content">
                          Engagement #{eng.id.slice(-6)}
                        </h4>
                      </div>
                      <p className="text-[11px] text-base-content/60 mt-1">
                        Status: <span className="font-bold text-base-content">{eng.status}</span>
                      </p>
                    </div>

                    <div className="w-full sm:w-48 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Progress</span>
                        <span>{eng.onboardingProgress}%</span>
                      </div>
                      <div className="w-full bg-base-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${eng.onboardingProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices Section */}
          <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
            <h3 className="text-base font-extrabold text-base-content flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-500" />
              <span>Billing &amp; Invoices</span>
            </h3>

            {!user.client?.invoices || user.client.invoices.length === 0 ? (
              <div className="p-6 text-center bg-base-200/30 rounded-2xl text-xs text-base-content/60">
                No invoices generated for this client.
              </div>
            ) : (
              <div className="space-y-2">
                {user.client.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-base-200/30 border border-base-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-base-content">{inv.invoiceNumber}</span>
                      <p className="text-[11px] text-base-content/60">{inv.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-base-content">{formatNaira(inv.amount)}</div>
                      <span
                        className={`badge text-[10px] font-bold ${
                          inv.status === "PAID"
                            ? "badge-success text-white"
                            : inv.status === "OVERDUE"
                            ? "badge-error text-white"
                            : "badge-warning"
                        }`}
                      >
                        {inv.status}
                      </span>
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

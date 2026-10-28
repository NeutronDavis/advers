import React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRightIcon,
  Building,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getUsersList } from "@/lib/kpi";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    source?: string;
    page?: string;
  }>;
}) {
  await requireStaff();

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const role = resolvedParams?.role || "ALL";
  const status = resolvedParams?.status || "ALL";
  const source = resolvedParams?.source || "ALL";
  const currentPage = parseInt(resolvedParams?.page || "1", 10);

  const { users, totalCount } = await getUsersList({
    search,
    role,
    status,
    source,
    page: currentPage,
    limit: 10,
  });

  const totalPages = Math.ceil(totalCount / 10) || 1;

  const roleFilters = [
    { label: "All Roles", value: "ALL" },
    { label: "Clients", value: "CLIENT" },
    { label: "Staff", value: "STAFF" },
    { label: "Admins", value: "ADMIN" },
  ];

  const statusFilters = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Prospect", value: "PROSPECT" },
    { label: "Unverified", value: "UNVERIFIED" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title & CSV Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            <span>Users &amp; Clients Directory</span>
            <span className="badge badge-primary text-xs font-bold">{totalCount} Total</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-1">
            Directory of registered client accounts, staff members, and lead conversion profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* CSV Export Button */}
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(
              "Name,Email,Company,Role,Status,Source,UTM Source,Signup Date,Last Login\n" +
                users
                  .map(
                    (u) =>
                      `"${u.name}","${u.email}","${u.company || ""}","${u.role}","${u.status}","${
                        u.source || ""
                      }","${u.utmSource || ""}","${u.createdAt}","${u.lastLoginAt || ""}"`
                  )
                  .join("\n")
            )}`}
            download="advers-users-export.csv"
            className="btn btn-outline border-base-300 text-xs font-bold rounded-xl h-10 px-4 gap-2 w-full sm:w-auto flex items-center justify-center"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Mobile App Vibe Filter Section */}
      <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-3d space-y-3">
        {/* Search Bar */}
        <form className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name, email, or company..."
              className="input input-bordered w-full pl-10 bg-base-200/50 text-xs h-10 rounded-xl focus:border-primary"
            />
            <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="btn bg-primary text-primary-content hover:bg-primary/90 text-xs font-bold rounded-xl h-10 min-h-0 px-4 shrink-0"
          >
            Search
          </button>
        </form>

        {/* Mobile Swipeable Quick-Filter Chips Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-primary" />
              <span>Role:</span>
            </span>
            {roleFilters.map((f) => (
              <Link
                key={f.value}
                href={`/admin/users?role=${f.value}&status=${status}&search=${search}`}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                  role === f.value
                    ? "bg-primary text-primary-content shadow-xs"
                    : "bg-base-200/60 text-base-content/70 hover:bg-base-300"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-primary" />
              <span>Status:</span>
            </span>
            {statusFilters.map((f) => (
              <Link
                key={f.value}
                href={`/admin/users?role=${role}&status=${f.value}&search=${search}`}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                  status === f.value
                    ? "bg-primary text-primary-content shadow-xs"
                    : "bg-base-200/60 text-base-content/70 hover:bg-base-300"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-base-100 p-8 rounded-3xl border border-base-200 text-center text-xs text-base-content/60">
            No users matching the specified filter criteria.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-3d space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-extrabold text-sm text-base-content hover:text-primary transition-colors block"
                  >
                    {user.name}
                  </Link>
                  <span className="text-xs text-base-content/60 block font-medium">
                    {user.email}
                  </span>
                </div>
                <span
                  className={`badge text-[10px] font-extrabold ${
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

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className={`badge text-[10px] font-extrabold ${
                    user.role === "ADMIN"
                      ? "badge-primary"
                      : user.role === "STAFF"
                      ? "badge-secondary"
                      : "badge-ghost"
                  }`}
                >
                  {user.role}
                </span>

                {user.company && (
                  <span className="badge badge-outline text-[10px] font-bold text-base-content/80">
                    <Building className="w-3 h-3 mr-1 text-primary" />
                    {user.company}
                  </span>
                )}

                {user.packageName && (
                  <span className="badge badge-outline text-[10px] font-bold text-primary">
                    {user.packageName}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-base-200 text-xs font-medium text-base-content/60">
                <span>
                  Source: <strong className="text-base-content">{user.source || "WEBSITE"}</strong>
                </span>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="btn btn-xs btn-primary font-bold rounded-lg gap-1 text-[11px]"
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Data Table View (>= md) */}
      <div className="hidden md:block bg-base-100 rounded-3xl border border-base-200 shadow-3d overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-left border-collapse">
            <thead>
              <tr className="bg-base-200/60 text-[11px] font-extrabold uppercase tracking-wider text-base-content/70">
                <th className="py-3.5 px-4">User / Account</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Source / UTM</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 text-xs font-medium">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-base-content/60">
                    No users matching the specified filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-base-200/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-extrabold text-base-content hover:text-primary transition-colors block"
                        >
                          {user.name}
                        </Link>
                        <span className="text-[11px] text-base-content/60 block font-normal">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.company ? (
                        <span className="font-bold text-base-content">{user.company}</span>
                      ) : (
                        <span className="text-base-content/40 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge text-[10px] font-extrabold ${
                          user.role === "ADMIN"
                            ? "badge-primary"
                            : user.role === "STAFF"
                            ? "badge-secondary"
                            : "badge-ghost"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge text-[10px] font-extrabold ${
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
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-base-content">{user.source || "WEBSITE"}</span>
                        {user.utmSource && (
                          <span className="text-[10px] text-base-content/50 block">
                            UTM: {user.utmSource}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.packageName ? (
                        <span className="badge badge-outline text-[10px] font-bold text-primary">
                          {user.packageName}
                        </span>
                      ) : (
                        <span className="text-base-content/40 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-base-content/70">
                      {new Date(user.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="btn btn-xs btn-outline border-base-300 font-bold rounded-lg gap-1"
                      >
                        <span>View</span>
                        <ArrowRightIcon className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 bg-base-100 rounded-3xl border border-base-200 shadow-3d flex justify-between items-center text-xs font-bold text-base-content/70">
          <span>
            Page {currentPage} of {totalPages} ({totalCount} items)
          </span>
          <div className="flex items-center gap-1">
            {currentPage > 1 && (
              <Link
                href={`/admin/users?page=${currentPage - 1}&search=${search}&role=${role}&status=${status}`}
                className="btn btn-xs btn-outline border-base-300 rounded-lg gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Prev</span>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/admin/users?page=${currentPage + 1}&search=${search}&role=${role}&status=${search}`}
                className="btn btn-xs btn-outline border-base-300 rounded-lg gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

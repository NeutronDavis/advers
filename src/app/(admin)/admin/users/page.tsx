import React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Shield,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { getUsersList } from "@/lib/kpi";

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            <span>Users &amp; Clients Management</span>
            <span className="badge badge-primary text-xs font-bold">{totalCount} Total</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-1">
            Directory of registered client accounts, staff members, and lead conversion profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            className="btn btn-outline border-base-300 text-xs font-bold rounded-xl h-10 px-4 gap-2"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-3d space-y-3">
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name, email, or company..."
              className="input input-bordered w-full pl-10 bg-base-200/50 text-xs h-10 rounded-xl focus:border-primary"
            />
            <Search className="w-4 h-4 text-base-content/40 absolute left-3 top-3" />
          </div>

          {/* Role Filter */}
          <select
            name="role"
            defaultValue={role}
            className="select select-bordered w-full bg-base-200/50 text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All Roles</option>
            <option value="CLIENT">Client</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            name="status"
            defaultValue={status}
            className="select select-bordered w-full bg-base-200/50 text-xs h-10 min-h-0 rounded-xl"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROSPECT">Prospect</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="btn bg-primary text-primary-content hover:bg-primary/90 text-xs font-bold rounded-xl h-10 min-h-0"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-3d overflow-hidden">
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
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-base-200 flex justify-between items-center text-xs font-bold text-base-content/70">
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
                  href={`/admin/users?page=${currentPage + 1}&search=${search}&role=${role}&status=${status}`}
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
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";
import {
  createBusinessProfileAction,
  deleteBusinessProfileAction,
  setPrimaryBusinessProfileAction,
  updateBusinessProfileAction,
} from "@/server/actions/business-profiles";

export interface BusinessProfileView {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  branches: string[];
  isPrimary: boolean;
  status: string;
}

const EMPTY_FORM = {
  name: "",
  category: "",
  location: "",
  branches: "",
};

export default function BusinessProfilesClient({
  profiles,
  planName,
  hasPlan,
  used,
  limit,
  canCreate,
  createBlockedReason,
  isOwner,
}: {
  profiles: BusinessProfileView[];
  planName: string;
  hasPlan: boolean;
  used: number;
  limit: number;
  canCreate: boolean;
  createBlockedReason: string | null;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (profile: BusinessProfileView) => {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      category: profile.category || "",
      location: profile.location || "",
      branches: profile.branches.join("\n"),
    });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = editingId
        ? await updateBusinessProfileAction({ id: editingId, ...form })
        : await createBusinessProfileAction(form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      closeForm();
      router.refresh();
    });
  };

  const makePrimary = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await setPrimaryBusinessProfileAction(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const remove = (profile: BusinessProfileView) => {
    if (!window.confirm(`Delete "${profile.name}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteBusinessProfileAction(profile.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Account &amp; branches
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Business Profiles
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Manage the businesses and branches that can run campaigns under your
            account.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge badge-lg bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
            {used} / {limit > 0 ? limit : "—"} profiles
          </span>
          {canCreate && isOwner && (
            <button
              type="button"
              onClick={openCreate}
              className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add profile</span>
            </button>
          )}
        </div>
      </div>

      {!hasPlan && (
        <div className="alert bg-[var(--portal-gold-soft)] border-[var(--portal-gold-border)] text-[var(--portal-body)] rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>
            You do not have an active plan. Choose a plan to create business
            profiles.
          </span>
          <Link
            href="/portal/billing"
            className="btn btn-xs bg-[var(--portal-obsidian)] text-white border-none rounded-lg font-bold ml-auto"
          >
            Choose plan
          </Link>
        </div>
      )}

      {hasPlan && !canCreate && createBlockedReason && (
        <div className="alert bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>{createBlockedReason}</span>
          <Link
            href="/portal/billing"
            className="btn btn-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none rounded-lg font-bold ml-auto"
          >
            Upgrade
          </Link>
        </div>
      )}

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!isOwner && (
        <div className="alert bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>
            Only the account owner can create, edit or remove business profiles.
            You can still view the account structure.
          </span>
        </div>
      )}

      {/* Usage */}
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[var(--portal-body)] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {planName} profile usage
          </span>
          <span className="text-[var(--portal-muted)]">
            {used} of {limit > 0 ? limit : "—"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--portal-line-soft)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--portal-gold)]"
            style={{ width: `${limit > 0 ? Math.max(percent, 3) : 0}%` }}
          />
        </div>
      </div>

      {/* Create / edit form */}
      {showForm && (
        <form
          onSubmit={submit}
          className="card bg-[var(--portal-surface)] border border-[var(--portal-gold-border)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              {editingId ? "Edit business profile" : "New business profile"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="btn btn-sm btn-circle btn-ghost text-[var(--portal-muted)]"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="profile-name"
                className="text-[11px] font-bold text-[var(--portal-ink)]"
              >
                Business / branch name *
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="e.g. Adebayo Holdings — Lekki Branch"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="profile-category"
                className="text-[11px] font-bold text-[var(--portal-ink)]"
              >
                Category / industry
              </label>
              <input
                id="profile-category"
                type="text"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                placeholder="e.g. Retail, Real Estate, Food"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="profile-location"
                className="text-[11px] font-bold text-[var(--portal-ink)]"
              >
                Primary location
              </label>
              <input
                id="profile-location"
                type="text"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="e.g. Lekki, Lagos"
                className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>

            <div className="space-y-1 sm:row-span-2">
              <label
                htmlFor="profile-branches"
                className="text-[11px] font-bold text-[var(--portal-ink)]"
              >
                Branches (one per line)
              </label>
              <textarea
                id="profile-branches"
                rows={4}
                value={form.branches}
                onChange={(event) =>
                  setForm((current) => ({ ...current, branches: event.target.value }))
                }
                placeholder={"Lekki Phase 1\nVictoria Island\nPort Harcourt GRA"}
                className="textarea textarea-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--portal-line-soft)]">
            <button
              type="button"
              onClick={closeForm}
              className="btn btn-ghost btn-sm text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold px-5"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <span>{editingId ? "Save changes" : "Create profile"}</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Profiles */}
      {profiles.length === 0 ? (
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            No business profiles yet
          </h2>
          <p className="text-xs text-[var(--portal-muted)] max-w-md mx-auto">
            Add your first business profile so you can start creating campaigns
            and managing branches.
          </p>
          {canCreate && isOwner && (
            <button
              type="button"
              onClick={openCreate}
              className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl text-xs font-bold"
            >
              Add business profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[var(--portal-gold-soft-3)] text-[var(--portal-gold-ink)] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-black text-[var(--portal-ink)]">
                        {profile.name}
                      </h2>
                      {profile.isPrimary && (
                        <span className="badge badge-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--portal-muted)] mt-0.5">
                      {profile.category || "No category set"}
                    </div>
                  </div>
                </div>
                <span className="badge badge-xs bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                  {profile.status}
                </span>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[var(--portal-body)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--portal-muted)] shrink-0 mt-0.5" />
                <span>{profile.location || "No location set"}</span>
              </div>

              {profile.branches.length > 0 && (
                <div className="p-3 rounded-2xl bg-[var(--portal-soft)] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">
                    Branches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.branches.map((branch) => (
                      <span
                        key={branch}
                        className="badge badge-xs bg-[var(--portal-surface)] border-[var(--portal-line)] text-[var(--portal-body)] font-medium"
                      >
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--portal-line-soft)]">
                  <div className="flex items-center gap-1">
                    {!profile.isPrimary && (
                      <button
                        type="button"
                        onClick={() => makePrimary(profile.id)}
                        disabled={isPending}
                        className="btn btn-xs btn-ghost text-[var(--portal-muted)] rounded-lg font-bold gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set primary
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(profile)}
                      className="btn btn-xs btn-ghost text-[var(--portal-gold-ink)] rounded-lg font-bold gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    {!profile.isPrimary && (
                      <button
                        type="button"
                        onClick={() => remove(profile)}
                        disabled={isPending}
                        className="btn btn-xs btn-ghost text-[var(--portal-muted)] hover:text-error rounded-lg font-bold gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Megaphone,
  Pencil,
  Plus,
  Send,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  archiveAdversPostAction,
  createAdversPostAction,
  publishAdversPostAction,
  updateAdversPostAction,
} from "@/server/actions/advers-posts";
import type { AdversPostView } from "@/server/data/posts";

type ActionResult = { success: true } | { success: false; error: string };

const EMPTY_FORM = {
  title: "",
  body: "",
  imageUrl: "",
  ctaLabel: "Learn more",
  ctaUrl: "",
  sponsorName: "",
  sponsorLogoUrl: "",
  category: "",
  placement: "DASHBOARD",
  startsAt: "",
  endsAt: "",
  targetAudience: "",
  publish: false,
};

export default function AdminPostsClient({
  posts,
}: {
  posts: AdversPostView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const run = (action: () => Promise<ActionResult>, message: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(message);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      router.refresh();
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (post: AdversPostView) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      body: post.body,
      imageUrl: post.imageUrl || "",
      ctaLabel: post.ctaLabel || "Learn more",
      ctaUrl: post.ctaUrl || "",
      sponsorName: post.sponsorName,
      sponsorLogoUrl: post.sponsorLogoUrl || "",
      category: post.category || "",
      placement: post.placement,
      startsAt: post.startsAt ? post.startsAt.slice(0, 10) : "",
      endsAt: post.endsAt ? post.endsAt.slice(0, 10) : "",
      targetAudience: "",
      publish: post.status === "PUBLISHED",
    });
    setError(null);
    setShowForm(true);
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      body: form.body,
      imageUrl: form.imageUrl,
      ctaLabel: form.ctaLabel,
      ctaUrl: form.ctaUrl,
      sponsorName: form.sponsorName,
      sponsorLogoUrl: form.sponsorLogoUrl,
      category: form.category,
      placement: form.placement,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      targetAudience: form.targetAudience,
      publish: form.publish,
    };
    if (editingId) {
      run(
        () => updateAdversPostAction(editingId, payload),
        "ADVERS post updated."
      );
    } else {
      run(() => createAdversPostAction(payload), "ADVERS post created.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            In-app advertising
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ADVERS Posts
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Create sponsored posts shown inside the advertiser portal.
          </p>
        </div>
        <button
          type="button"
          onClick={showForm ? () => setShowForm(false) : openCreate}
          className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close form" : "Create post"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success text-xs rounded-2xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={save}
          className="card bg-base-100 border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">
              {editingId ? "Edit ADVERS post" : "Create ADVERS post"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Sponsor name *</label>
              <input
                type="text"
                required
                value={form.sponsorName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sponsorName: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold">Body *</label>
            <textarea
              rows={3}
              required
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              className="textarea textarea-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Sponsor logo URL</label>
              <input
                type="url"
                value={form.sponsorLogoUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sponsorLogoUrl: event.target.value,
                  }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">CTA label</label>
              <input
                type="text"
                value={form.ctaLabel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ctaLabel: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">CTA URL</label>
              <input
                type="text"
                value={form.ctaUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ctaUrl: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                placeholder="e.g. Retail, Finance"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Starts</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startsAt: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Ends</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endsAt: event.target.value }))
                }
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold">
              Target audience notes (future targeting)
            </label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetAudience: event.target.value,
                }))
              }
              placeholder="e.g. Lagos SMEs interested in retail"
              className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-base-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={form.publish}
                onChange={(event) =>
                  setForm((current) => ({ ...current, publish: event.target.checked }))
                }
                className="checkbox checkbox-primary checkbox-sm"
              />
              Publish immediately
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary rounded-xl font-bold gap-2"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {editingId ? "Save changes" : "Create post"}
            </button>
          </div>
        </form>
      )}

      <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4">
        <div>
          <h2 className="text-base font-bold">Sponsored posts</h2>
          <p className="text-xs text-base-content/60">
            Posts shown in the dashboard ADVERS POSTS widget.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="py-12 text-center text-xs text-base-content/60">
            No ADVERS posts yet.
          </div>
        ) : (
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                <th>Post</th>
                <th>Sponsor</th>
                <th>Placement</th>
                <th>Status</th>
                <th>Schedule</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 text-xs">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-base-200/50">
                  <td>
                    <div className="font-black">{post.title}</div>
                    <div className="text-[10px] text-base-content/50 line-clamp-1">
                      {post.body}
                    </div>
                  </td>
                  <td className="font-bold">{post.sponsorName}</td>
                  <td className="text-base-content/70">{post.placement}</td>
                  <td>
                    <span
                      className={`badge badge-xs font-bold ${
                        post.status === "PUBLISHED"
                          ? "badge-success badge-soft"
                          : post.status === "SCHEDULED"
                            ? "badge-info badge-soft"
                            : "badge-ghost"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="text-[10px] text-base-content/60">
                    {post.startsAt ? formatDate(post.startsAt) : "—"} →{" "}
                    {post.endsAt ? formatDate(post.endsAt) : "—"}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="btn btn-xs btn-ghost border border-base-300 rounded-lg font-bold"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {post.status !== "PUBLISHED" && (
                        <button
                          type="button"
                          onClick={() =>
                            run(
                              () => publishAdversPostAction(post.id),
                              "Post published."
                            )
                          }
                          disabled={isPending}
                          className="btn btn-xs btn-primary rounded-lg font-bold"
                        >
                          Publish
                        </button>
                      )}
                      {post.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() =>
                            run(
                              () => archiveAdversPostAction(post.id),
                              "Post archived."
                            )
                          }
                          disabled={isPending}
                          className="btn btn-xs btn-ghost text-base-content/50 rounded-lg"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

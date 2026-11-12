"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/booster";
import type { NotificationView } from "@/server/data/booster";

export default function NotificationsClient({
  notifications,
}: {
  notifications: NotificationView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const unread = notifications.filter((item) => !item.readAt).length;

  const markRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  };

  const markAll = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Account updates
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Campaign, quote, payment and account updates.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge badge-lg bg-[var(--portal-gold-soft-2)] border-[var(--portal-gold-border)] text-[var(--portal-gold-ink)] font-bold">
            {unread} unread
          </span>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              disabled={isPending}
              className="btn btn-sm btn-ghost border border-[var(--portal-line)] text-[var(--portal-body)] rounded-xl text-xs font-bold gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-12 text-center space-y-3">
          <Bell className="w-8 h-8 text-[var(--portal-muted)] mx-auto" />
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            No notifications yet
          </h2>
          <p className="text-xs text-[var(--portal-muted)] max-w-sm mx-auto">
            Campaign reviews, quote updates, payment confirmations and account
            changes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card rounded-2xl border p-4 shadow-xs ${
                notification.readAt
                  ? "bg-[var(--portal-surface)] border-[var(--portal-line)]"
                  : "bg-[var(--portal-gold-soft)] border-[var(--portal-gold-border)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-[var(--portal-ink)]">
                      {notification.title}
                    </h2>
                    {!notification.readAt && (
                      <span className="badge badge-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none font-bold">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--portal-body)] mt-1">
                    {notification.body}
                  </p>
                  <div className="text-[10px] text-[var(--portal-muted)] mt-1">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="btn btn-xs btn-ghost border border-[var(--portal-line)] text-[var(--portal-body)] rounded-lg font-bold gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </Link>
                  )}
                  {!notification.readAt && (
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      disabled={isPending}
                      className="btn btn-xs btn-ghost text-[var(--portal-success)] rounded-lg font-bold gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

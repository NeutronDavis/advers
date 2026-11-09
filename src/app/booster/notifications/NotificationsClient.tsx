"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CheckCircle2, ExternalLink } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            In-app notifications
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Applications, assignments, proof decisions and job updates.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge badge-lg badge-warning badge-soft font-bold">
            {unread} unread
          </span>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              disabled={isPending}
              className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-12 text-center space-y-3">
          <Bell className="w-8 h-8 text-base-content/30 mx-auto" />
          <h2 className="text-base font-bold">No notifications yet</h2>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            When you apply for a job, receive an assignment or get proof reviewed,
            updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card rounded-2xl border p-4 shadow-xs ${
                notification.readAt
                  ? "bg-base-100 border-base-200"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold">{notification.title}</h2>
                    {!notification.readAt && (
                      <span className="badge badge-xs badge-primary font-bold">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-base-content/70 mt-1">
                    {notification.body}
                  </p>
                  <div className="text-[10px] text-base-content/50 mt-1">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="btn btn-xs btn-ghost border border-base-300 rounded-lg font-bold gap-1"
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
                      className="btn btn-xs btn-ghost text-success rounded-lg font-bold gap-1"
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

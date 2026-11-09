"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  AlertCircle,
  Copy,
  CheckCircle2,
  Trash2,
  Clock,
  Crown,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  inviteTeamMemberAction,
  removeTeamMemberAction,
  revokeInvitationAction,
} from "@/server/actions/team";

export interface TeamMemberView {
  id: string;
  name: string;
  email: string;
  role: string;
  orgRole: string;
  status: string;
  lastLoginAt: string | null;
}

export interface TeamInvitationView {
  id: string;
  email: string;
  expiresAt: string;
  createdAt: string;
}

export default function TeamClient({
  members,
  invitations,
  planName,
  hasPlan,
  used,
  limit,
  canInvite,
  inviteBlockedReason,
  isOwner,
  currentUserId,
}: {
  members: TeamMemberView[];
  invitations: TeamInvitationView[];
  planName: string;
  hasPlan: boolean;
  used: number;
  limit: number;
  canInvite: boolean;
  inviteBlockedReason: string | null;
  isOwner: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const submitInvite = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInviteUrl(null);
    setCopied(false);

    startTransition(async () => {
      const result = await inviteTeamMemberAction({ email, name });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEmail("");
      setName("");
      setInviteUrl(result.inviteUrl || null);
      router.refresh();
    });
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(`${window.location.origin}${inviteUrl}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const revoke = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await revokeInvitationAction(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const removeMember = (member: TeamMemberView) => {
    if (!window.confirm(`Remove ${member.name} from this account?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeTeamMemberAction(member.id);
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
            Business Pro collaboration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Team &amp; Access
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Invite colleagues to collaborate on campaigns under your account.
            Team members only see the account they are assigned to.
          </p>
        </div>
        <span className="badge badge-lg bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold self-start sm:self-auto">
          {used} / {limit > 0 ? limit : "—"} seats
        </span>
      </div>

      {!hasPlan && (
        <div className="alert bg-[var(--portal-gold-soft)] border-[var(--portal-gold-border)] text-[var(--portal-body)] rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>Choose a plan before inviting team members.</span>
          <Link
            href="/portal/billing"
            className="btn btn-xs bg-[var(--portal-obsidian)] text-white border-none rounded-lg font-bold ml-auto"
          >
            Choose plan
          </Link>
        </div>
      )}

      {hasPlan && !canInvite && inviteBlockedReason && (
        <div className="alert bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
          <AlertCircle className="w-4 h-4 text-[var(--portal-gold-ink)]" />
          <span>{inviteBlockedReason}</span>
          {limit === 0 && (
            <Link
              href="/portal/billing"
              className="btn btn-xs bg-[var(--portal-gold)] text-[var(--portal-obsidian)] border-none rounded-lg font-bold ml-auto"
            >
              Upgrade to Business Pro
            </Link>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {inviteUrl && (
        <div className="alert bg-[var(--portal-success-soft)] border-[var(--portal-line)] text-[var(--portal-body)] rounded-2xl text-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--portal-success)]" />
          <span className="min-w-0 truncate">
            Invitation created. Share this link: {inviteUrl}
          </span>
          <button
            type="button"
            onClick={copyInvite}
            className="btn btn-xs bg-[var(--portal-obsidian)] text-white border-none rounded-lg font-bold ml-auto gap-1"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* Usage */}
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[var(--portal-body)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {planName} team seats
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite form */}
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--portal-ink)] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[var(--portal-gold-ink)]" />
              Invite a team member
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)] mt-0.5">
              The invite link expires after 7 days. Only the account owner can
              invite or remove members.
            </p>
          </div>

          {!isOwner ? (
            <div className="p-4 rounded-2xl bg-[var(--portal-soft)] text-xs text-[var(--portal-muted)]">
              Only the account owner can manage team access.
            </div>
          ) : (
            <form onSubmit={submitInvite} className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="team-name"
                  className="text-[11px] font-bold text-[var(--portal-ink)]"
                >
                  Name (optional)
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Bisi Akande"
                  className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="team-email"
                  className="text-[11px] font-bold text-[var(--portal-ink)]"
                >
                  Email address *
                </label>
                <input
                  id="team-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="colleague@company.ng"
                  className="input input-bordered w-full text-sm rounded-xl bg-[var(--portal-soft)] border-[var(--portal-line)]"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !canInvite}
                className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white border-none rounded-xl text-xs font-bold w-full gap-1.5 disabled:opacity-60"
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>Create invitation</span>
              </button>
            </form>
          )}
        </div>

        {/* Members and invitations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)]">
                  Account members
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  People with access to this account.
                </p>
              </div>
              <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                {members.length} total
              </span>
            </div>

            <div className="divide-y divide-[var(--portal-line-soft)]">
              {members.map((member) => {
                const isSelf = member.id === currentUserId;
                const isOwnerMember = member.orgRole === "OWNER";
                return (
                  <div
                    key={member.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--portal-gold-soft-2)] text-[var(--portal-gold-ink)] flex items-center justify-center font-black text-xs shrink-0">
                        {member.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--portal-ink)] flex items-center gap-1.5">
                          <span className="truncate">{member.name}</span>
                          {isSelf && (
                            <span className="badge badge-xs bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                              You
                            </span>
                          )}
                          {isOwnerMember && (
                            <Crown className="w-3 h-3 text-[var(--portal-gold-ink)]" />
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--portal-muted)] truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="badge badge-xs bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold hidden sm:inline-flex">
                        {member.orgRole}
                      </span>
                      <span
                        className={`badge badge-xs font-bold ${
                          member.status === "ACTIVE"
                            ? "badge-success badge-soft"
                            : "badge-warning badge-soft"
                        }`}
                      >
                        {member.status}
                      </span>
                      {isOwner && !isOwnerMember && !isSelf && (
                        <button
                          type="button"
                          onClick={() => removeMember(member)}
                          disabled={isPending}
                          className="btn btn-xs btn-ghost text-[var(--portal-muted)] hover:text-error rounded-lg"
                          aria-label={`Remove ${member.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
              <div>
                <h2 className="text-base font-bold text-[var(--portal-ink)]">
                  Pending invitations
                </h2>
                <p className="text-[11px] text-[var(--portal-muted)]">
                  Invitations that have not been accepted yet.
                </p>
              </div>
              <span className="badge badge-sm bg-[var(--portal-soft)] border-[var(--portal-line)] text-[var(--portal-muted)] font-bold">
                {invitations.length} pending
              </span>
            </div>

            {invitations.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--portal-muted)]">
                No pending invitations.
              </div>
            ) : (
              <div className="divide-y divide-[var(--portal-line-soft)]">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-[var(--portal-muted)] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--portal-ink)] truncate">
                          {invitation.email}
                        </div>
                        <div className="text-[10px] text-[var(--portal-muted)]">
                          Expires {formatDate(invitation.expiresAt)}
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => revoke(invitation.id)}
                        disabled={isPending}
                        className="btn btn-xs btn-ghost text-[var(--portal-muted)] hover:text-error rounded-lg font-bold"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-[var(--portal-soft)] text-[10px] text-[var(--portal-muted)] flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[var(--portal-success)] shrink-0" />
        <span>
          Team members can collaborate on campaigns under this account. They do
          not automatically become Boosters, and they cannot access your private
          billing or payment details.
        </span>
      </div>
    </div>
  );
}

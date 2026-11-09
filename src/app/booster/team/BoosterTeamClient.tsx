"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Plus,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  addBoosterTeamMemberAction,
  archiveBoosterTeamAction,
  createBoosterTeamAction,
  removeBoosterTeamMemberAction,
} from "@/server/actions/booster-teams";
import type { BoosterTeamView } from "@/server/data/booster";

type ActionResult = { success: true } | { success: false; error: string };

export default function BoosterTeamClient({
  teams,
}: {
  teams: BoosterTeamView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState<Record<string, string>>({});

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
      router.refresh();
    });
  };

  const createTeam = (event: React.FormEvent) => {
    event.preventDefault();
    run(
      () => createBoosterTeamAction({ name, description }),
      "Booster team created."
    );
    setName("");
    setDescription("");
    setShowCreate(false);
  };

  const addMember = (teamId: string) => {
    const email = memberEmail[teamId] || "";
    run(
      () => addBoosterTeamMemberAction({ teamId, email }),
      "Team member added."
    );
    setMemberEmail((current) => ({ ...current, [teamId]: "" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster collaboration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Booster teams
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Form a team, add fellow Boosters and coordinate larger campaign work
            packages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((current) => !current)}
          className="btn btn-sm btn-primary rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? "Close form" : "Create team"}
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

      {showCreate && (
        <form
          onSubmit={createTeam}
          className="card bg-base-100 border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">Create a Booster team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="team-name" className="text-xs font-bold">
                Team name *
              </label>
              <input
                id="team-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Port Harcourt Launch Crew"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="team-description" className="text-xs font-bold">
                Description
              </label>
              <input
                id="team-description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What this team delivers"
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary rounded-xl font-bold gap-2"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create team
            </button>
          </div>
        </form>
      )}

      {teams.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-8 h-8 text-base-content/30 mx-auto" />
          <h2 className="text-base font-bold">No Booster teams yet</h2>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Create a team to coordinate campaign managers, designers, printers,
            delivery agents and field marketers.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn btn-sm btn-primary rounded-xl font-bold"
          >
            Create your first team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-base-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black">{team.name}</h2>
                    <span
                      className={`badge badge-xs font-bold ${
                        team.status === "ACTIVE"
                          ? "badge-success badge-soft"
                          : "badge-ghost"
                      }`}
                    >
                      {team.status}
                    </span>
                    {team.isManager && (
                      <span className="badge badge-xs badge-primary badge-soft font-bold">
                        Manager
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-base-content/60 mt-1">
                    Managed by {team.managerName} · {team.members.length} member
                    {team.members.length === 1 ? "" : "s"} · {team.jobs.length} job
                    {team.jobs.length === 1 ? "" : "s"}
                  </div>
                  {team.description && (
                    <p className="text-xs text-base-content/70 mt-1">
                      {team.description}
                    </p>
                  )}
                </div>
                {team.isManager && team.status !== "ARCHIVED" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Archive this team?")) return;
                      run(
                        () => archiveBoosterTeamAction(team.id),
                        "Team archived."
                      );
                    }}
                    disabled={isPending}
                    className="btn btn-xs btn-ghost text-base-content/50 rounded-lg font-bold gap-1"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-base-content/50">
                    Team members
                  </div>
                  <div className="divide-y divide-base-200">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="py-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold">{member.name}</div>
                            <div className="text-[9px] text-base-content/50">
                              {member.role}
                            </div>
                          </div>
                        </div>
                        {team.isManager && member.role !== "MANAGER" && (
                          <button
                            type="button"
                            onClick={() =>
                              run(
                                () =>
                                  removeBoosterTeamMemberAction({
                                    teamId: team.id,
                                    memberId: member.id,
                                  }),
                                "Team member removed."
                              )
                            }
                            disabled={isPending}
                            className="btn btn-xs btn-ghost text-base-content/40 hover:text-error rounded-lg"
                            aria-label={`Remove ${member.name}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {team.isManager && team.status !== "ARCHIVED" && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="email"
                        value={memberEmail[team.id] || ""}
                        onChange={(event) =>
                          setMemberEmail((current) => ({
                            ...current,
                            [team.id]: event.target.value,
                          }))
                        }
                        placeholder="Booster email"
                        className="input input-bordered input-sm flex-1 text-xs rounded-lg bg-base-200/50"
                      />
                      <button
                        type="button"
                        onClick={() => addMember(team.id)}
                        disabled={isPending || !memberEmail[team.id]}
                        className="btn btn-xs btn-primary rounded-lg font-bold gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-base-content/50">
                    Team jobs
                  </div>
                  {team.jobs.length === 0 ? (
                    <div className="p-3 rounded-xl bg-base-200/40 text-[11px] text-base-content/60">
                      No jobs assigned to this team yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-base-200">
                      {team.jobs.map((job) => (
                        <Link
                          key={job.id}
                          href={`/booster/jobs/${job.id}`}
                          className="py-2 flex items-center justify-between gap-2 text-xs hover:bg-base-200/40 px-1 rounded-lg"
                        >
                          <div className="min-w-0">
                            <div className="font-bold truncate">{job.title}</div>
                            <div className="text-[9px] text-base-content/50">
                              {job.categoryLabel} ·{" "}
                              {job.deadline ? formatDate(job.deadline) : "Flexible"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

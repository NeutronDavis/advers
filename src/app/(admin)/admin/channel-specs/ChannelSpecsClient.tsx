"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { updateChannelSpecAction } from "@/server/actions/channel-specs";

interface SpecRow {
  id: string;
  channel: string;
  fieldKey: string;
  label: string;
  inputType: string;
  required: boolean;
  active: boolean;
  maxBytes: number | null;
  minWidth: number | null;
  maxWidth: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  minDurationSec: number | null;
  maxDurationSec: number | null;
}

function num(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export default function ChannelSpecsClient({ specs }: { specs: SpecRow[] }) {
  const [rows, setRows] = useState<SpecRow[]>(specs);
  const [isPending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (id: string, patch: Partial<SpecRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const save = (row: SpecRow) => {
    setError(null);
    setSavedId(null);
    startTransition(async () => {
      const result = await updateChannelSpecAction({
        id: row.id,
        label: row.label,
        required: row.required,
        active: row.active,
        maxBytes: row.maxBytes,
        minWidth: row.minWidth,
        maxWidth: row.maxWidth,
        minHeight: row.minHeight,
        maxHeight: row.maxHeight,
        minDurationSec: row.minDurationSec,
        maxDurationSec: row.maxDurationSec,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSavedId(row.id);
    });
  };

  const groups = rows.reduce<Record<string, SpecRow[]>>((acc, row) => {
    acc[row.channel] = acc[row.channel] ?? [];
    acc[row.channel].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-base-200 pb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-primary">
          Media configuration
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Channel Specifications
        </h1>
        <p className="mt-0.5 text-xs text-base-content/70 sm:text-sm">
          Control the fields and media limits shown in the advertisement builder.
          Changes apply to new campaigns.
        </p>
      </div>

      {error && <div className="alert alert-error text-xs">{error}</div>}

      {Object.entries(groups).map(([channel, channelRows]) => (
        <section key={channel} className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <h2 className="text-sm font-black uppercase tracking-wide text-primary">
            {channel.replace(/_/g, " ")}
          </h2>
          <div className="mt-3 space-y-3">
            {channelRows.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-base-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold">{row.fieldKey}</div>
                    <div className="text-[10px] text-base-content/50">
                      {row.inputType}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={row.required}
                        onChange={(event) =>
                          update(row.id, { required: event.target.checked })
                        }
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={row.active}
                        onChange={(event) =>
                          update(row.id, { active: event.target.checked })
                        }
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => save(row)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : savedId === row.id ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save
                    </button>
                  </div>
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="form-control">
                    <span className="label-text text-[10px]">Label</span>
                    <input
                      className="input input-bordered input-xs"
                      value={row.label}
                      onChange={(event) => update(row.id, { label: event.target.value })}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Max MB</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.maxBytes ? Math.round(row.maxBytes / 1024 / 1024) : ""}
                      onChange={(event) =>
                        update(row.id, {
                          maxBytes: num(event.target.value)
                            ? Number(event.target.value) * 1024 * 1024
                            : null,
                        })
                      }
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Min width</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.minWidth ?? ""}
                      onChange={(event) =>
                        update(row.id, { minWidth: num(event.target.value) })
                      }
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Max width</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.maxWidth ?? ""}
                      onChange={(event) =>
                        update(row.id, { maxWidth: num(event.target.value) })
                      }
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Min height</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.minHeight ?? ""}
                      onChange={(event) =>
                        update(row.id, { minHeight: num(event.target.value) })
                      }
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Max height</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.maxHeight ?? ""}
                      onChange={(event) =>
                        update(row.id, { maxHeight: num(event.target.value) })
                      }
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Min duration (s)</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.minDurationSec ?? ""}
                      onChange={(event) =>
                        update(row.id, { minDurationSec: num(event.target.value) })
                      }
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text text-[10px]">Max duration (s)</span>
                    <input
                      type="number"
                      className="input input-bordered input-xs"
                      value={row.maxDurationSec ?? ""}
                      onChange={(event) =>
                        update(row.id, { maxDurationSec: num(event.target.value) })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { uploadMediaAssetAction } from "@/server/actions/media";
import {
  addPortfolioMediaItemAction,
  deletePortfolioItemAction,
} from "@/server/actions/portfolio";

export interface PortfolioMediaItem {
  id: string;
  title: string;
  description: string | null;
  mediaUrl: string | null;
}

export default function PortfolioMediaManager({
  items,
}: {
  items: PortfolioMediaItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose an image or video file.");
      return;
    }
    setUploading(true);
    startTransition(async () => {
      try {
        const data = new FormData();
        data.append("file", file);
        const upload = await uploadMediaAssetAction(data);
        if (!upload.success) {
          setError(upload.error);
          return;
        }
        const result = await addPortfolioMediaItemAction({
          title,
          description: description || undefined,
          mediaAssetId: upload.asset.id,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setTitle("");
        setDescription("");
        setFile(null);
        router.refresh();
      } finally {
        setUploading(false);
      }
    });
  };

  const remove = (itemId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deletePortfolioItemAction(itemId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="card mt-6 border border-base-200 bg-base-100 p-6 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          Portfolio media
        </h2>
        <p className="text-[11px] text-base-content/60">
          Upload images or videos that appear in the portfolio section of your
          marketplace profile. External links can still be added above.
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-base-200"
            >
              {item.mediaUrl && (
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="h-28 w-full object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-2 p-3">
                <div>
                  <div className="text-xs font-bold">{item.title}</div>
                  {item.description && (
                    <div className="text-[10px] text-base-content/60">
                      {item.description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => remove(item.id)}
                  disabled={isPending}
                  aria-label={`Remove ${item.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
        <label className="form-control">
          <span className="label-text text-xs font-bold">Title</span>
          <input
            className="input input-bordered"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Campaign case study"
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs font-bold">Description (optional)</span>
          <input
            className="input input-bordered"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short outcome or context"
          />
        </label>
        <label className="form-control sm:col-span-2">
          <span className="label-text text-xs font-bold">Image or video</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="file-input file-input-bordered w-full"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isPending || uploading || !file}
          >
            {uploading || isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload portfolio item
          </button>
        </div>
      </form>

      {error && <div className="alert alert-error text-xs">{error}</div>}
    </section>
  );
}

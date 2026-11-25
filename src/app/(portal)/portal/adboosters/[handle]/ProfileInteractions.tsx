"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Heart,
  Loader2,
  MessageSquare,
  Star,
  ThumbsUp,
} from "lucide-react";
import {
  addBoosterCommentAction,
  submitBoosterReviewAction,
  toggleBoosterLikeAction,
  toggleBoosterRecommendationAction,
} from "@/server/actions/marketplace";

export default function ProfileInteractions({
  boosterId,
  likeCount,
  recommendationCount,
  initialLiked,
  initialRecommended,
  canReview,
  isOwner,
  myReview,
}: {
  boosterId: string;
  likeCount: number;
  recommendationCount: number;
  initialLiked: boolean;
  initialRecommended: boolean;
  canReview: boolean;
  isOwner: boolean;
  myReview: {
    score: number;
    moderationState: string;
    verified: boolean;
  } | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [recommended, setRecommended] = useState(initialRecommended);
  const [likes, setLikes] = useState(likeCount);
  const [recommendations, setRecommendations] = useState(recommendationCount);
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toggleLike = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleBoosterLikeAction(boosterId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setLiked(result.liked);
      setLikes(result.count);
      router.refresh();
    });
  };

  const toggleRecommend = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleBoosterRecommendationAction(boosterId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRecommended(result.recommended);
      setRecommendations((current) => Math.max(0, current + (result.recommended ? 1 : -1)));
      router.refresh();
    });
  };

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await addBoosterCommentAction({ boosterId, body: comment });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setComment("");
      setNotice("Comment submitted for moderation.");
      router.refresh();
    });
  };

  const submitReview = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await submitBoosterReviewAction({
        boosterId,
        score,
        body: reviewBody || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setReviewBody("");
      setNotice("Review submitted for moderation.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {!isOwner && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-xl ${liked ? "btn-primary" : "btn-ghost border border-base-300"}`}
            onClick={toggleLike}
            disabled={isPending}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {liked ? "Liked" : "Like"} · {likes}
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-xl ${
              recommended ? "btn-secondary" : "btn-ghost border border-base-300"
            }`}
            onClick={toggleRecommend}
            disabled={isPending}
          >
            <ThumbsUp className={`h-4 w-4 ${recommended ? "fill-current" : ""}`} />
            {recommended ? "Recommended" : "Recommend"} · {recommendations}
          </button>
        </div>
      )}

      {error && <div className="alert alert-error text-xs">{error}</div>}
      {notice && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {!isOwner && (
        <form
          onSubmit={submitComment}
          className="rounded-2xl border border-base-300 bg-base-100 p-4"
        >
          <label className="text-xs font-bold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Ask a question or leave a comment
          </label>
          <textarea
            className="textarea textarea-bordered mt-2 w-full text-sm"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Ask about availability, turnaround, or scope."
            required
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isPending || comment.trim().length < 2}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit comment
            </button>
          </div>
        </form>
      )}

      {canReview && !myReview && (
        <form
          onSubmit={submitReview}
          className="rounded-2xl border border-success/40 bg-success/5 p-4"
        >
          <div className="text-xs font-bold flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            Leave a verified review
          </div>
          <p className="mt-1 text-[11px] text-base-content/60">
            You completed a job with this Booster. Reviews are moderated before
            appearing publicly.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
            <label className="form-control">
              <span className="label-text text-[11px] font-bold">Rating</span>
              <select
                className="select select-bordered"
                value={score}
                onChange={(event) => setScore(Number(event.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control">
              <span className="label-text text-[11px] font-bold">Review</span>
              <textarea
                className="textarea textarea-bordered text-sm"
                rows={2}
                maxLength={2000}
                value={reviewBody}
                onChange={(event) => setReviewBody(event.target.value)}
                placeholder="What was it like working with this Booster?"
              />
            </label>
          </div>
          <div className="mt-2 flex justify-end">
            <button type="submit" className="btn btn-success btn-sm" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit review
            </button>
          </div>
        </form>
      )}

      {myReview && (
        <div className="alert alert-info text-xs">
          <Star className="h-4 w-4" />
          <span>
            You left a {myReview.score}-star review. Status:{" "}
            <strong>{myReview.moderationState}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}

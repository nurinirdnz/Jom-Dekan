import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useCastVote, useRemoveVote } from "../../hooks/useForum";
import type { VoteTargetType } from "../../types/forum";

export function VoteButtons({
  targetType,
  targetId,
  voteScore,
  myVote,
}: {
  targetType: VoteTargetType;
  targetId: string;
  voteScore: number;
  myVote: number;
}) {
  const castVote = useCastVote();
  const removeVote = useRemoveVote();
  const isPending = castVote.isPending || removeVote.isPending;

  // Optimistic: updates the instant you click rather than waiting for
  // the request + cache invalidation to round-trip first. Clears itself
  // once the real (refetched) data matches the prediction, or
  // immediately if the request fails.
  const [optimistic, setOptimistic] = useState<{ voteScore: number; myVote: number } | null>(null);
  useEffect(() => {
    if (optimistic && voteScore === optimistic.voteScore && myVote === optimistic.myVote) {
      setOptimistic(null);
    }
  }, [voteScore, myVote, optimistic]);

  const displayScore = optimistic?.voteScore ?? voteScore;
  const displayMyVote = optimistic?.myVote ?? myVote;

  const handleVote = (value: 1 | -1) => {
    const nextMyVote = displayMyVote === value ? 0 : value;
    setOptimistic({ voteScore: displayScore + (nextMyVote - displayMyVote), myVote: nextMyVote });

    if (nextMyVote === 0) {
      removeVote.mutate({ targetType, targetId }, { onError: () => setOptimistic(null) });
    } else {
      castVote.mutate({ targetType, targetId, value }, { onError: () => setOptimistic(null) });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isPending}
        aria-label="Upvote"
        className={`rounded p-1 hover:bg-slate-100 disabled:opacity-60 ${
          displayMyVote === 1 ? "text-primary-600" : "text-slate-400"
        }`}
      >
        <ThumbsUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium text-slate-700">
        {displayScore}
      </span>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        aria-label="Downvote"
        className={`rounded p-1 hover:bg-slate-100 disabled:opacity-60 ${
          displayMyVote === -1 ? "text-red-600" : "text-slate-400"
        }`}
      >
        <ThumbsDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

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

  const handleVote = (value: 1 | -1) => {
    if (myVote === value) {
      removeVote.mutate({ targetType, targetId });
    } else {
      castVote.mutate({ targetType, targetId, value });
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
          myVote === 1 ? "text-primary-600" : "text-slate-400"
        }`}
      >
        <ThumbsUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium text-slate-700">
        {voteScore}
      </span>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        aria-label="Downvote"
        className={`rounded p-1 hover:bg-slate-100 disabled:opacity-60 ${
          myVote === -1 ? "text-red-600" : "text-slate-400"
        }`}
      >
        <ThumbsDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

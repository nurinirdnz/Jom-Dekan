import { Heart } from "lucide-react";
import { useFavoriteStatus, useAddFavorite, useRemoveFavorite } from "../../hooks/useFavorites";
import type { FavoriteTargetType } from "../../types/favorite";

/**
 * Shared heart toggle for anything favoritable (resources, forum posts,
 * marketplace listings) — one place for the status query + add/remove
 * mutations instead of re-implementing this per page. Always stops
 * propagation since every "icon" usage sits inside a clickable card/row.
 */
export function FavoriteButton({
  targetType,
  targetId,
  variant = "icon",
}: {
  targetType: FavoriteTargetType;
  targetId: string;
  // "icon": compact circular toggle for card grids/rows.
  // "pill": labeled "Favorite"/"Favorited" button — the original detail-page style.
  variant?: "icon" | "pill";
}) {
  const { data: isFavorited, isLoading } = useFavoriteStatus(targetType, targetId);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const isPending = addFavorite.isPending || removeFavorite.isPending;

  const handleClick = (e: React.MouseEvent) => {
    if (variant === "icon") {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFavorited) removeFavorite.mutate({ targetType, targetId });
    else addFavorite.mutate({ targetType, targetId });
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || isPending}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition motion-safe:duration-150 disabled:opacity-60 ${
          isFavorited
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        <Heart className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} aria-hidden="true" />
        {isFavorited ? "Favorited" : "Favorite"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={Boolean(isFavorited)}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition motion-safe:duration-150 hover:-translate-y-0.5 disabled:opacity-60 ${
        isFavorited
          ? "border-amber-300 bg-[#FDF3DA] text-[#8A6A00]"
          : "border-[#E4E3F2] bg-white text-slate-400 hover:border-amber-200 hover:text-amber-600"
      }`}
    >
      <Heart className="h-4 w-4" aria-hidden="true" fill={isFavorited ? "currentColor" : "none"} />
    </button>
  );
}

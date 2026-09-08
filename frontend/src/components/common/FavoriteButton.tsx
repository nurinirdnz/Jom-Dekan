import { Heart } from "lucide-react";
import {
  useFavoriteStatus,
  useAddFavorite,
  useRemoveFavorite,
} from "../../hooks/useFavorites";

export function FavoriteButton({ resourceId }: { resourceId: string }) {
  const { data: isFavorited, isLoading } = useFavoriteStatus(resourceId);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const isPending = addFavorite.isPending || removeFavorite.isPending;

  const handleClick = () => {
    if (isFavorited) {
      removeFavorite.mutate(resourceId);
    } else {
      addFavorite.mutate(resourceId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isPending}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 ${
        isFavorited
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <Heart
        className="h-4 w-4"
        fill={isFavorited ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {isFavorited ? "Favorited" : "Favorite"}
    </button>
  );
}

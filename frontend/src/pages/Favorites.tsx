import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useFavorites, useRemoveFavorite } from "../hooks/useFavorites";

export default function Favorites() {
  const { data, isLoading, isError } = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const favorites = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My Favorites</h1>
      <p className="mt-1 text-sm text-slate-500">
        Resources you've saved for later.
      </p>

      <div className="mt-6">
        {isLoading ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Loading…
          </p>
        ) : isError ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-red-600">
            Could not load favorites.
          </p>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <div
                key={f.favoriteId}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <Link
                  to={`/resources/${f.resource.id}`}
                  className="flex aspect-video w-full items-center justify-center bg-slate-100"
                >
                  <FileText
                    className="h-10 w-10 text-slate-300"
                    aria-hidden="true"
                  />
                </Link>
                <div className="flex flex-col p-5">
                  <Link
                    to={`/resources/${f.resource.id}`}
                    className="font-semibold text-slate-800 hover:text-primary-700"
                  >
                    {f.resource.title}
                  </Link>
                  {f.resource.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {f.resource.description}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFavorite.mutate(f.resource.id)}
                    disabled={removeFavorite.isPending}
                    className="mt-3 self-start rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                  >
                    Remove from favorites
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            You haven't favorited anything yet.
          </p>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Heart, Search, MessageSquare, Briefcase, GraduationCap } from "lucide-react";
import { useFavorites, useRemoveFavorite } from "../hooks/useFavorites";
import { EmptyState } from "../components/common/EmptyState";
import { ResourceCardSkeleton } from "../components/common/ResourceCardSkeleton";
import type { FavoriteListItem } from "../types/favorite";

const EMPTY_FAVORITES: FavoriteListItem[] = [];

const TABS = [
  { key: "resources", label: "Resources", icon: FileText, available: true },
  { key: "discussions", label: "Discussions", icon: MessageSquare, available: false },
  { key: "tutors", label: "Tutors", icon: GraduationCap, available: false },
  { key: "opportunities", label: "Opportunities", icon: Briefcase, available: false },
] as const;

export default function Favorites() {
  const { data, isLoading, isError } = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const [search, setSearch] = useState("");
  const allFavorites = data?.data ?? EMPTY_FAVORITES;

  const favorites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allFavorites;
    return allFavorites.filter((f) => f.resource.title.toLowerCase().includes(q));
  }, [allFavorites, search]);

  return (
    <div className="mx-auto max-w-6xl px-[18px] py-[22px]">
      <h1 className="text-2xl font-bold text-slate-900">Saved Items</h1>
      <p className="mt-1 text-sm text-slate-500">
        Resources, discussions, tutors, and opportunities you've saved for later.
      </p>

      {/* Only "Resources" is backed by real data today — favoriting a
          discussion, tutor, or opportunity isn't a capability the backend
          supports yet, so those tabs are shown but disabled rather than
          faked. */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map(({ key, label, icon: Icon, available }) => (
          <button
            key={key}
            type="button"
            disabled={!available}
            title={available ? undefined : "Coming soon"}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition motion-safe:duration-150 ${
              available
                ? "border-primary-600 text-primary-700"
                : "cursor-not-allowed border-transparent text-slate-400"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
            {!available && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your favorites…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Heart}
            title="Could not load favorites"
            description="Something went wrong while fetching your favorites. Please try again."
          />
        ) : allFavorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="You haven't saved anything yet"
            description="Save resources you want to come back to later, and they'll show up here."
            primaryAction={{ label: "Explore resources", to: "/resources" }}
            secondaryAction={{ label: "Browse marketplace", to: "/marketplace" }}
          />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching favorites"
            description="Try a different search term."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <div
                key={f.favoriteId}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#ECEBF7] bg-white shadow-sm transition motion-safe:duration-150 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
              >
                <Link
                  to={`/resources/${f.resource.id}`}
                  className="flex aspect-video w-full items-center justify-center bg-slate-100"
                >
                  <FileText className="h-10 w-10 text-slate-300" aria-hidden="true" />
                </Link>
                <div className="flex flex-1 flex-col p-5">
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
                  <p className="mt-2 text-xs text-slate-400">
                    Saved {new Date(f.favoritedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={`/resources/${f.resource.id}`}
                      className="rounded-full bg-primary-600 px-4 py-1.5 text-xs font-medium text-white transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-primary-700"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFavorite.mutate(f.resource.id)}
                      disabled={removeFavorite.isPending}
                      className="flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 transition motion-safe:duration-150 hover:bg-slate-200 disabled:opacity-60"
                    >
                      <Heart className="h-3.5 w-3.5 fill-current text-red-500" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

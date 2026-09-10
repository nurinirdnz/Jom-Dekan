import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useResources } from "../../hooks/useResources";

// Matches the exact row shape rendered below (icon + two text lines in a
// bordered row) — the shared ResourceCardSkeleton is for the full
// thumbnail grid cards on the Resources/Favorites pages, a different
// shape, so it can't be reused here without a layout shift on reveal.
function RecommendedResourceRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#ECEBF7] p-3 motion-safe:animate-pulse" aria-hidden="true">
      <div className="mt-0.5 h-5 w-5 shrink-0 rounded bg-slate-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function RecommendedResources({ forceLoading = false }: { forceLoading?: boolean }) {
  const { data, isLoading, isError } = useResources({
    sortBy: "newest",
    page: 1,
    pageSize: 4,
  });
  const resources = data?.data ?? [];
  const showSkeleton = forceLoading || isLoading;

  return (
    <div className="rounded-[22px] border border-[#ECEBF7] bg-white p-5 shadow-sm" aria-busy={showSkeleton}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Recommended resources</h2>
        <Link to="/resources" className="text-sm font-medium text-primary-700 hover:text-primary-800">
          View all →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showSkeleton ? (
          <>
            <RecommendedResourceRowSkeleton />
            <RecommendedResourceRowSkeleton />
            <RecommendedResourceRowSkeleton />
            <RecommendedResourceRowSkeleton />
          </>
        ) : isError ? (
          <p className="col-span-full text-sm text-red-600">Could not load resources.</p>
        ) : resources.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500">
            No resources yet — be the first to upload one.
          </p>
        ) : (
          resources.map((r) => (
            <Link
              key={r.id}
              to={`/resources/${r.id}`}
              className="flex items-start gap-3 rounded-lg border border-[#ECEBF7] p-3 transition motion-safe:duration-150 hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{r.title}</p>
                <p className="text-xs text-slate-400">
                  Added {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

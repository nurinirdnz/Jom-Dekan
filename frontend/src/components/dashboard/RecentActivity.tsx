import { Bell } from "lucide-react";
import { useModeration } from "../../hooks/useModeration";
import type { Notification } from "../../types/moderation";

export function RecentActivity({ forceLoading = false }: { forceLoading?: boolean }) {
  const { notifications, isLoadingNotifications } = useModeration();
  const recent = notifications.slice(0, 5);
  const showSkeleton = forceLoading || isLoadingNotifications;

  return (
    <div className="rounded-[22px] border border-[#ECEBF7] bg-white p-5 shadow-sm" aria-busy={showSkeleton}>
      <h2 className="font-semibold text-slate-800">Recent activity</h2>

      {showSkeleton ? (
        <div className="mt-4 flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Nothing new yet — activity on your posts, favorites, and uploads will show up here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-slate-100">
          {recent.map((n: Notification) => (
            <li key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Bell
                className={`mt-0.5 h-4 w-4 shrink-0 ${n.read_at ? "text-slate-300" : "text-primary-600"}`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className={`text-sm ${n.read_at ? "text-slate-500" : "font-medium text-slate-800"}`}>
                  {n.payload?.message || n.type}
                </p>
                <span className="text-xs text-slate-400">
                  {new Date(n.created_at).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

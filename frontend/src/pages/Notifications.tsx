import { Bell } from "lucide-react";
import { useModeration } from "../hooks/useModeration";
import { EmptyState } from "../components/common/EmptyState";
import type { Notification } from "../types/moderation";

export default function Notifications() {
  const { notifications, isLoadingNotifications, markAsRead } = useModeration();
  const unread = notifications.filter((n: Notification) => !n.read_at);

  function handleMarkAllRead() {
    unread.forEach((n: Notification) => markAsRead(n.id));
  }

  return (
    <div className="mx-auto max-w-[900px] px-[18px] py-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unread.length} unread · updates on your resources, forum activity, and more.
          </p>
        </div>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="rounded-full border border-[#ECEBF7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition motion-safe:duration-150 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-[#ECEBF7] bg-white" aria-busy={isLoadingNotifications}>
        {isLoadingNotifications ? (
          <div className="divide-y divide-[#F4F3FB]" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <div className="h-[38px] w-[38px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-2">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="Updates on your resources, forum replies and more will show up here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#F4F3FB]">
            {notifications.map((n: Notification) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => !n.read_at && markAsRead(n.id)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left transition motion-safe:duration-150 hover:bg-[#F8F8FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#EFEEFB] text-[#4338CA]">
                    <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.read_at ? "font-medium text-slate-600" : "font-bold text-slate-900"}`}>
                      {n.payload?.message || n.type}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </span>
                  {!n.read_at && (
                    <span className="mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full bg-[#4338CA]" aria-label="Unread" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

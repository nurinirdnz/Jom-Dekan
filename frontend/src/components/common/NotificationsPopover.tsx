import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useModeration } from "../../hooks/useModeration";
import type { Notification } from "../../types/moderation";

export function NotificationsPopover() {
  const { notifications, isLoadingNotifications, markAsRead } = useModeration();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n: Notification) => !n.read_at).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#ECEBF7] text-slate-500 transition motion-safe:duration-150 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E8543F]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#ECEBF7] bg-white shadow-xl motion-safe:animate-[fadeIn_150ms_ease-out]">
          <div className="flex items-center justify-between border-b border-[#F1F0FA] bg-[#F8F8FD] px-4 py-3 text-sm font-bold text-slate-700">
            <span>Notifications</span>
            <span className="text-xs font-semibold text-primary-600">{unreadCount} unread</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F3FB]">
            {isLoadingNotifications ? (
              <p className="p-4 text-center text-xs text-slate-400">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400">No notifications yet.</p>
            ) : (
              notifications.slice(0, 6).map((n: Notification) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-2 px-4 py-3 text-xs ${n.read_at ? "text-slate-500" : "bg-primary-50/60 font-medium text-slate-800"}`}
                >
                  <div className="min-w-0">
                    <p className="truncate">{n.payload?.message || n.type}</p>
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {!n.read_at && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 text-[10px] font-semibold text-primary-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-[#F1F0FA] px-4 py-2.5 text-center text-xs font-semibold text-primary-600 hover:bg-primary-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsPopover;

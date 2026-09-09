import { useState } from "react";
import { useModeration } from "../../hooks/useModeration";
import type { Notification } from "../../types/moderation";

export function NotificationsPopover() {
  const { notifications, isLoadingNotifications, markAsRead } = useModeration();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n: Notification) => !n.read_at).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-600 hover:text-stone-900 focus:outline-none"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 bg-stone-100 border-b flex justify-between items-center text-sm font-bold text-stone-700">
            <span>Notifications</span>
            <span className="text-xs text-stone-500">{unreadCount} unread</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {isLoadingNotifications ? (
              <div className="p-4 text-center text-xs text-stone-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500">
                No notifications found.
              </div>
            ) : (
              notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs flex justify-between items-start gap-2 ${n.read_at ? "bg-white text-stone-600" : "bg-blue-50/50 text-stone-900 font-medium"}`}
                >
                  <div>
                    <p>{n.payload?.message || n.type}</p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!n.read_at && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-blue-600 hover:underline shrink-0 text-[10px]"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPopover;

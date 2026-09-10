import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";

// The marketplace/opportunity model has no scheduling data yet (no
// date/time field), so there is nothing real to list here. Showing an
// honest empty state instead of fabricated sample sessions.
export function UpcomingSessions() {
  return (
    <div className="rounded-[22px] border border-[#ECEBF7] bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-800">Upcoming sessions</h2>
      <div className="mt-4 flex flex-col items-start gap-2">
        <CalendarClock className="h-6 w-6 text-slate-300" aria-hidden="true" />
        <p className="text-sm text-slate-500">
          No sessions scheduled yet. Find a tutor or study group to get started.
        </p>
        <Link
          to="/marketplace"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Browse marketplace →
        </Link>
      </div>
    </div>
  );
}

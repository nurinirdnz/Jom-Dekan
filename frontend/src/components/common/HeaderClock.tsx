import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/**
 * The viewer's own device clock (Date/toLocaleTimeString read local
 * time zone automatically) — not a server-synced time, just a live
 * read of "what time is it right now for you".
 */
export function HeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      title={now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
      className="hidden h-10 shrink-0 cursor-default items-center gap-1.5 rounded-full border border-[#ECEBF7] bg-[#F8F8FC] px-3.5 text-sm font-semibold text-slate-600 transition motion-safe:duration-150 hover:scale-105 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 sm:flex dark:border-[#332C63] dark:bg-[#231E4A] dark:text-slate-300 dark:hover:border-primary-400/40 dark:hover:bg-[#2A2455] dark:hover:text-primary-300"
    >
      <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
}

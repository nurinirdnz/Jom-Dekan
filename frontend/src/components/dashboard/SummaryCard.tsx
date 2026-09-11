import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isLoading?: boolean;
  // Reference rotates a distinct icon-container tint per stat card
  // (purple/amber/blue/green) rather than reusing one color everywhere —
  // defaults to the purple pair so existing callers keep working.
  iconClass?: string;
  // Staggers the reveal animation across a row of cards that all finish
  // loading on the same tick, instead of everything popping in at once.
  revealDelayMs?: number;
}

export function SummaryCard({
  icon: Icon,
  label,
  value,
  isLoading,
  iconClass = "bg-[#EFEEFB] text-[#4338CA]",
  revealDelayMs = 0,
}: SummaryCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-[20px] border border-[#ECEBF7] bg-white p-[18px] shadow-sm transition motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-md"
      aria-busy={isLoading}
    >
      <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[13px] ${iconClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-6 w-10 animate-pulse rounded bg-slate-200" aria-hidden="true" />
        ) : (
          <p
            style={{ animationDelay: `${revealDelayMs}ms` }}
            className="text-xl font-bold text-slate-900 motion-safe:animate-[fadeIn_350ms_ease-out_both]"
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

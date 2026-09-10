export function MarketplaceCardSkeleton() {
  return (
    <div
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm motion-safe:animate-pulse"
      aria-hidden="true"
    >
      <div className="space-y-3">
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-2/3 rounded bg-slate-100" />
      </div>
      <div className="mt-6 h-9 w-full rounded-lg bg-slate-100" />
    </div>
  );
}

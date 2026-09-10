export function ResourceCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm motion-safe:animate-pulse"
      aria-hidden="true"
    >
      <div className="aspect-video w-full bg-slate-200" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-12 shrink-0 rounded-full bg-slate-100" />
        </div>
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
    </div>
  );
}

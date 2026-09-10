export function ForumPostSkeleton() {
  return (
    <div
      className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm motion-safe:animate-pulse"
      aria-hidden="true"
    >
      <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function ForumPostSkeleton() {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-[#ECEBF7] bg-white p-5 shadow-sm motion-safe:animate-pulse"
      aria-hidden="true"
    >
      <div className="h-[76px] w-[72px] shrink-0 rounded-2xl bg-slate-100" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="h-4 w-16 rounded-full bg-slate-100" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
      <div className="hidden h-10 w-28 shrink-0 rounded-xl bg-slate-100 sm:block" />
    </div>
  );
}

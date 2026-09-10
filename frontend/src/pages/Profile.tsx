import { useState } from "react";
import { useCurrentUser, useForgotPassword } from "../hooks/useAuth";
import { useResources } from "../hooks/useResources";
import { usePosts } from "../hooks/useForum";

// Fields the backend doesn't expose to the frontend yet:
// - "displayName" is actually stored (user_profiles.display_name on
//   registration) but /auth/me doesn't return it — exposing it would be
//   a backend change, so this still derives a name from the email.
// - University/Programme have no backing field at all.
// Shown as disabled inputs (not editable) rather than invented values,
// and "Save changes" stays disabled to match — there's no endpoint to
// send it to.
const ACCOUNT_FIELDS = [
  { key: "name", label: "Full name" },
  { key: "email", label: "Student email" },
  { key: "university", label: "University" },
  { key: "programme", label: "Programme" },
] as const;

// Same reasoning as the header/sidebar's disabled menu items elsewhere
// in this app — these need a real preferences endpoint before a toggle
// here would mean anything.
const PREFERENCES = [
  { label: "Forum replies", meta: "Email me when someone answers my thread" },
  { label: "Upload verification", meta: "Notify me when moderation completes" },
  { label: "Weekly digest", meta: "Top resources for my courses each Sunday" },
  { label: "Public profile", meta: "Show my uploads and contributor rating" },
];

function DisabledToggle() {
  return (
    <span
      title="Coming soon"
      className="relative inline-flex h-[26px] w-[46px] shrink-0 cursor-not-allowed items-center rounded-full bg-slate-200"
    >
      <span className="absolute left-[3px] h-5 w-5 rounded-full bg-white shadow-sm" />
    </span>
  );
}

export default function Profile() {
  const user = useCurrentUser();
  const displayName = user?.email ? user.email.split("@")[0] : "";
  const forgotPassword = useForgotPassword();

  // Real counts — the two the reference shows that this app doesn't
  // track anywhere (contributor rating, total downloads) are rendered
  // as "—" further down instead of invented numbers.
  const myResources = useResources({ mine: true, page: 1, pageSize: 1 });
  const myPosts = usePosts({ mine: true, page: 1, pageSize: 1 });

  const [resetSent, setResetSent] = useState(false);

  function handleSendResetLink() {
    if (!user?.email) return;
    forgotPassword.mutate({ email: user.email }, { onSuccess: () => setResetSent(true) });
  }

  const accountValues: Record<string, string | null> = {
    name: displayName,
    email: user?.email ?? "",
    university: null,
    programme: null,
  };

  return (
    <div className="mx-auto max-w-[1000px] px-[18px] py-[22px]">
      <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Your details, contribution record and notification preferences.</p>

      {/* Hero — same gradient family as the dashboard's hero card. */}
      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-[22px] p-[22px] text-white"
        style={{ background: "radial-gradient(120% 140% at 85% 10%, #4A3FD1 0%, #2E2372 55%, #231C57 100%)" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#F5C21A] text-xl font-extrabold text-[#231C57]">
            {user?.email[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold tracking-tight">{displayName}</p>
            <p className="truncate text-sm font-medium text-[#C6C2EC]">
              {user?.role === "ADMIN" ? "Administrator" : "Student"}
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-white/[.16] bg-white/[.09] sm:grid-cols-4" style={{ minWidth: 260 }}>
          {[
            { label: "Uploads", value: myResources.data?.meta.total ?? "—", isLoading: myResources.isLoading },
            { label: "Rating", value: "—" },
            { label: "Downloads", value: "—" },
            { label: "Threads", value: myPosts.data?.meta.total ?? "—", isLoading: myPosts.isLoading },
          ].map(({ label, value, isLoading }, i) => (
            <div key={label} className={`flex flex-col items-center gap-1 px-2 py-4 ${i > 0 ? "border-l border-white/[.12]" : ""}`}>
              <span className="text-xl font-extrabold leading-none">
                {isLoading ? <span className="inline-block h-5 w-6 animate-pulse rounded bg-white/20" /> : value}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#B9B4E4]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-[#ECEBF7] bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">Account details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACCOUNT_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
              <input
                type="text"
                value={accountValues[key] ?? ""}
                placeholder={accountValues[key] === null ? "Not set yet" : undefined}
                disabled
                title="Editing isn't available yet"
                className="h-11 cursor-not-allowed rounded-xl border border-[#E4E3F2] bg-slate-50 px-3 text-sm font-medium text-slate-700 placeholder:font-normal placeholder:italic placeholder:text-slate-400"
              />
            </label>
          ))}
        </div>

        <h2 className="mt-8 font-semibold text-slate-800">Preferences</h2>
        <p className="mt-0.5 text-sm text-slate-500">These aren&apos;t wired up to a real preferences endpoint yet.</p>
        <div className="mt-4 flex flex-col gap-2">
          {PREFERENCES.map(({ label, meta }) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-[#ECEBF7] p-3.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{meta}</p>
              </div>
              <DisabledToggle />
            </div>
          ))}
        </div>

        <h2 className="mt-8 font-semibold text-slate-800">Password &amp; security</h2>
        <div className="mt-4 rounded-xl border border-[#ECEBF7] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Current password", hint: "Enter current password" },
              { label: "New password", hint: "At least 8 characters" },
              { label: "Confirm new password", hint: "Repeat new password" },
            ].map((f) => (
              <label key={f.label} className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{f.label}</span>
                <input
                  type="password"
                  placeholder={f.hint}
                  disabled
                  title="Changing your password from here isn't available yet — use the email reset link instead"
                  className="h-11 cursor-not-allowed rounded-xl border border-[#E4E3F2] bg-slate-50 px-3 text-sm placeholder:text-slate-400"
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs font-medium text-slate-400">
            Direct password changes aren&apos;t available yet — use the email reset link below instead.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled
              title="Coming soon"
              className="h-11 cursor-not-allowed rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-400"
            >
              Reset password
            </button>
            <button
              type="button"
              onClick={handleSendResetLink}
              disabled={forgotPassword.isPending || resetSent || !user?.email}
              className="text-sm font-bold text-primary-600 transition motion-safe:duration-150 hover:text-primary-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {resetSent ? "Reset link sent — check your email" : forgotPassword.isPending ? "Sending…" : "Send me a reset link"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            title="Coming soon — no account-update endpoint yet"
            className="h-11 cursor-not-allowed rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-400"
          >
            Save changes
          </button>
          <button
            type="button"
            disabled
            title="Coming soon — no account-deletion endpoint yet"
            className="h-11 cursor-not-allowed rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-400"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

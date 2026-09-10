import { useMemo, useState } from "react";
import axios from "axios";
import { Briefcase, Plus, X, Check } from "lucide-react";
import { useOpportunities } from "../../hooks/useOpportunities";
import { EmptyState } from "../common/EmptyState";
import { MarketplaceCardSkeleton } from "./MarketplaceCardSkeleton";
import type { Opportunity, OpportunityMode } from "../../types/opportunity";

const MODE_LABEL: Record<OpportunityMode, string> = {
  ONLINE: "Remote",
  PHYSICAL: "On campus",
  HYBRID: "Hybrid",
};

const SKILL_OPTIONS = ["Design", "Web dev", "Mobile dev", "Copywriting", "Video", "Data entry"];

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "Post your listing",
    body: "Job details, budget, deadline and contact details — about five minutes.",
  },
  {
    n: "2",
    title: "Accept the poster terms",
    body: "Including that JomDekan only lists your opportunity and isn't responsible for what happens afterward.",
  },
  {
    n: "3",
    title: "Your listing goes live",
    body: "It appears here for students to find and apply to. Admins can still close a listing that breaks the academic-integrity policy.",
  },
  {
    n: "4",
    title: "Students apply directly to you",
    body: "You review applicants and agree on payment and delivery directly — JomDekan doesn't process payments or verify the work.",
  },
];

const TERMS = [
  {
    key: "legit",
    title: "Genuine paid work",
    body: "This is real, lawful work with a real budget — not an unpaid “exposure” task or a recruitment funnel.",
  },
  {
    key: "integrity",
    title: "No academic dishonesty",
    body: "I will not ask a student to write, sit or complete any assignment, test or assessed submission on someone's behalf.",
  },
  {
    key: "pay",
    title: "Pay on agreed terms",
    body: "I will pay the agreed amount for work delivered as agreed. JomDekan does not process, hold or guarantee any payment.",
  },
  {
    key: "accurate",
    title: "Accurate listing",
    body: "My scope, budget, deadline and contact details are accurate, and I accept moderator review or removal of this listing.",
  },
  {
    key: "liability",
    title: "JomDekan's role and liability",
    body: "I understand JomDekan only lists this opportunity. JomDekan is not a party to, and holds no responsibility for, the outcome, payment, quality, safety, or any dispute arising between me and the student(s) who respond to it.",
  },
] as const;

type TermKey = (typeof TERMS)[number]["key"];

interface PostForm {
  title: string;
  org: string;
  budget: string;
  paymentType: string;
  mode: OpportunityMode;
  closes: string;
  phone: string;
  email: string;
  brief: string;
  scope: string;
}

const EMPTY_FORM: PostForm = {
  title: "",
  org: "",
  budget: "",
  paymentType: "",
  mode: "ONLINE",
  closes: "",
  phone: "",
  email: "",
  brief: "",
  scope: "",
};

// New listings from this form always write a labeled block into the
// existing `description` column (no schema change) — parsed back out
// below for display. Anything posted before this form existed (or
// posted elsewhere) just falls back to showing the raw description.
function buildDescription(f: PostForm, skills: string[]) {
  return [
    `Organisation/client: ${f.org}`,
    `Budget: RM ${f.budget}`,
    `Payment type: ${f.paymentType}`,
    `Applications close: ${f.closes}`,
    skills.length ? `Skills needed: ${skills.join(", ")}` : null,
    `Contact: ${f.phone} · ${f.email}`,
    `Brief/website: ${f.brief}`,
    `\n${f.scope.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseListing(description: string) {
  const get = (label: string) => {
    const m = description.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : null;
  };
  return {
    org: get("Organisation/client"),
    budget: get("Budget"),
    closes: get("Applications close"),
    skills: get("Skills needed")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
  };
}

export function FreelanceView() {
  const { opportunities, isLoading, createOpportunity, applyToOpportunity } = useOpportunities();

  const gigs = useMemo(
    () => (opportunities as Opportunity[]).filter((o) => o.listing_type !== "TUTORING" && o.status === "active"),
    [opportunities],
  );

  const [howOpen, setHowOpen] = useState(false);

  const [postOpen, setPostOpen] = useState(false);
  const [postStep, setPostStep] = useState<1 | 2>(1);
  const [postDone, setPostDone] = useState(false);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [skills, setSkills] = useState<Record<string, boolean>>({});
  const [terms, setTerms] = useState<Record<TermKey, boolean>>({
    legit: false,
    integrity: false,
    pay: false,
    accurate: false,
    liability: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const [selectedOpp, setSelectedOpp] = useState<string | null>(null);
  const [coverMessage, setCoverMessage] = useState("");

  function updateForm<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openPost() {
    setPostOpen(true);
    setPostDone(false);
    setPostStep(1);
  }
  function closePost() {
    setPostOpen(false);
  }

  const emailOk = /.+@.+\..+/.test(form.email);
  const step1Ready =
    form.title.trim() &&
    form.org.trim() &&
    form.budget.trim() &&
    form.paymentType.trim() &&
    form.closes.trim() &&
    form.scope.trim().length >= 20 &&
    form.phone.trim() &&
    emailOk &&
    form.brief.trim();
  const termsReady = Object.values(terms).every(Boolean);

  async function handleSubmit() {
    if (!termsReady) return;
    setSubmitting(true);
    const skillList = Object.entries(skills)
      .filter(([, on]) => on)
      .map(([label]) => label);

    try {
      await createOpportunity({
        title: form.title.slice(0, 120),
        description: buildDescription(form, skillList),
        // No dedicated "freelance" category exists in the backend yet —
        // PROJECT_MENTORSHIP is the closest existing listing type, so
        // freelance gigs post under that rather than fabricating a new
        // enum value.
        listingType: "PROJECT_MENTORSHIP",
        mode: form.mode,
      });
      setPostDone(true);
      setForm(EMPTY_FORM);
      setSkills({});
      setTerms({ legit: false, integrity: false, pay: false, accurate: false, liability: false });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message
        : undefined;
      alert(message || "Failed to post your listing");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      await applyToOpportunity({ opportunityId: selectedOpp, coverMessage });
      setSelectedOpp(null);
      setCoverMessage("");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message
        : undefined;
      alert(message || "Failed to submit application");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Freelance Opportunities</h1>
          <p className="mt-1 text-sm text-slate-500">Paid student gigs from campus clubs, startups and lecturers.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={openPost}
            className="flex items-center gap-2 rounded-xl bg-[#F5C21A] px-4 py-2.5 text-sm font-bold text-[#231C57] transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-[#FFD24D] active:translate-y-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post an opportunity
          </button>
          <button
            type="button"
            onClick={() => setHowOpen((v) => !v)}
            aria-expanded={howOpen}
            className="rounded-xl border border-[#E4E3F2] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition motion-safe:duration-150 hover:border-primary-300 hover:text-primary-700"
          >
            How it works
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        Every listing is manually reviewed. Academic ghost-writing requests are rejected and reported.
      </div>

      {howOpen && (
        <section className="flex flex-col gap-4 rounded-[22px] border border-[#ECEBF7] bg-white p-5 motion-safe:animate-[fadeIn_150ms_ease-out]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[16.5px] font-bold text-slate-900">How freelance opportunities work</h2>
              <p className="mt-0.5 text-sm text-slate-500">Four steps from posting to getting work done.</p>
            </div>
            <button
              type="button"
              onClick={() => setHowOpen(false)}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4E3F2] text-slate-500 hover:bg-slate-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} className="rounded-xl border border-[#ECEBF7] p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFEEFB] text-sm font-bold text-[#4338CA]">
                  {s.n}
                </span>
                <p className="mt-2 text-sm font-bold text-slate-800">{s.title}</p>
                <p className="mt-1 text-xs text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-[#F8F8FD] p-4 text-xs font-semibold text-slate-600">
            JomDekan only lists opportunities — we're not a party to any arrangement between a poster and a student, and
            aren't responsible for payment, delivery, or what happens afterward. Ghost-writing or completing graded work
            for someone is never allowed.
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MarketplaceCardSkeleton key={i} />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No opportunities posted yet" description="Be the first to post one — students will see it here.">
          <button
            type="button"
            onClick={openPost}
            className="mt-6 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Post an opportunity
          </button>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {gigs.map((opp) => {
            const parsed = parseListing(opp.description);
            return (
              <article
                key={opp.id}
                className="flex flex-wrap items-center gap-4 rounded-[20px] border border-[#ECEBF7] bg-white p-[18px] transition motion-safe:duration-150 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-bold text-slate-900">{opp.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {parsed.org || opp.owner_name || "A JomDekan student"} &middot; {MODE_LABEL[opp.mode]}
                    {parsed.closes ? ` · closes ${parsed.closes}` : ""}
                  </p>
                  {parsed.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parsed.skills.map((s) => (
                        <span key={s} className="rounded-full bg-[#F1F0FA] px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {!parsed.budget && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{opp.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {parsed.budget && <span className="text-lg font-extrabold text-[#2E2372]">RM {parsed.budget}</span>}
                  <button
                    type="button"
                    onClick={() => setSelectedOpp(opp.id)}
                    className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    Apply
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Post-a-listing modal */}
      {postOpen && (
        <div role="dialog" aria-modal="true" aria-label="Post a freelance opportunity" className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8">
          <div className="w-full max-w-[640px] overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div
              className="flex items-start justify-between gap-4 p-[22px] text-white"
              style={{ background: "radial-gradient(120% 160% at 88% 8%, #4A3FD1 0%, #2E2372 55%, #231C57 100%)" }}
            >
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-[rgba(245,194,26,.2)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#FFE9A6]">
                  {postDone ? "DONE" : `STEP ${postStep} OF 2`}
                </span>
                <h2 className="mt-2 text-xl font-extrabold">
                  {postDone ? "Listing submitted" : "Post a freelance opportunity"}
                </h2>
                <p className="mt-1 text-sm font-medium text-[#C6C2EC]">
                  {postDone
                    ? "Your listing is live in the marketplace for students to find."
                    : postStep === 2
                      ? "Review and accept the poster terms to publish your listing."
                      : "Describe the work, the budget and how students can reach you."}
                </p>
              </div>
              <button
                type="button"
                onClick={closePost}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {postDone ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F5EC] text-[#1B7A55]">
                  <Check className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="max-w-sm text-sm text-slate-500">
                  Students can now find and apply to your listing from this page. You can close it any time from the
                  marketplace.
                </p>
                <button type="button" onClick={closePost} className="mt-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">
                  Back to opportunities
                </button>
              </div>
            ) : postStep === 1 ? (
              <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto p-[22px]">
                <section className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold tracking-wide text-primary-700">JOB DETAILS</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Job title" required hint="e.g. Poster design for MPP Week" value={form.title} onChange={(v) => updateForm("title", v)} />
                    <Field label="Organisation / client" required hint="e.g. UiTM Student Council" value={form.org} onChange={(v) => updateForm("org", v)} />
                    <Field label="Budget (RM)" required hint="e.g. 250" value={form.budget} onChange={(v) => updateForm("budget", v)} />
                    <Field label="Payment type" required hint="Fixed, hourly or milestone" value={form.paymentType} onChange={(v) => updateForm("paymentType", v)} />
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-500">
                        Work mode / location<span className="text-red-500"> *</span>
                      </span>
                      <select
                        value={form.mode}
                        onChange={(e) => updateForm("mode", e.target.value as OpportunityMode)}
                        className="h-11 rounded-xl border border-[#E4E3F2] bg-[#FBFBFE] px-3 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {(["ONLINE", "PHYSICAL", "HYBRID"] as OpportunityMode[]).map((m) => (
                          <option key={m} value={m}>
                            {MODE_LABEL[m]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Field label="Applications close" required hint="e.g. 22 Sep 2026" value={form.closes} onChange={(v) => updateForm("closes", v)} />
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-500">
                      Scope of work<span className="text-red-500"> *</span>
                    </span>
                    <textarea
                      rows={4}
                      placeholder="Deliverables, timeline, tools, and what a good submission looks like…"
                      value={form.scope}
                      onChange={(e) => updateForm("scope", e.target.value)}
                      className="resize-y rounded-xl border border-[#E4E3F2] bg-[#FBFBFE] p-3 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </label>
                </section>

                <section className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold tracking-wide text-primary-700">
                    CONTACT DETAILS <span className="font-semibold text-slate-400">· all required</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Phone number" required hint="+60 12-345 6789" note="WhatsApp-capable number" value={form.phone} onChange={(v) => updateForm("phone", v)} />
                    <Field
                      label="Email address"
                      required
                      hint="name@organisation.com"
                      note="Applications are sent here"
                      invalid={!!form.email && !emailOk}
                      value={form.email}
                      onChange={(v) => updateForm("email", v)}
                    />
                    <Field label="Brief / website link" required hint="https://…" note="Full brief, portfolio spec or company page" value={form.brief} onChange={(v) => updateForm("brief", v)} />
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold tracking-wide text-primary-700">SKILLS NEEDED</h3>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((label) => {
                      const on = !!skills[label];
                      return (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setSkills((s) => ({ ...s, [label]: !s[label] }))}
                          className={`h-9 rounded-full border px-3.5 text-xs font-bold transition motion-safe:duration-150 ${
                            on ? "border-primary-500 bg-primary-50 text-primary-700" : "border-[#E4E3F2] text-slate-600 hover:border-primary-300"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="flex flex-wrap justify-end gap-3 border-t border-[#F1F0FA] pt-4">
                  <button type="button" onClick={closePost} className="rounded-xl border border-[#E4E3F2] px-5 py-3 text-sm font-bold text-slate-700 hover:border-primary-300 hover:text-primary-700">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => step1Ready && setPostStep(2)}
                    disabled={!step1Ready}
                    title={step1Ready ? undefined : "Fill in every required field, including scope of work and a valid email"}
                    className={`rounded-xl px-5 py-3 text-sm font-bold transition motion-safe:duration-150 ${
                      step1Ready ? "cursor-pointer bg-primary-600 text-white hover:bg-primary-700" : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }`}
                  >
                    Continue to terms
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-[22px]">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Poster terms &amp; conditions</h3>
                  <p className="mt-1 text-sm text-slate-500">Tick each item to publish your listing.</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {TERMS.map((t) => {
                    const on = terms[t.key];
                    return (
                      <button
                        key={t.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setTerms((s) => ({ ...s, [t.key]: !s[t.key] }))}
                        className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition motion-safe:duration-150 ${
                          on ? "border-primary-200 bg-primary-50/60" : "border-[#ECEBF7] bg-white hover:border-primary-100"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 ${
                            on ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-slate-900">{t.title}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">{t.body}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  By posting you confirm this listing is accurate and lawful, and accept moderator review or removal.
                </p>
                <div className="flex flex-wrap justify-between gap-3 border-t border-[#F1F0FA] pt-4">
                  <button type="button" onClick={() => setPostStep(1)} className="rounded-xl border border-[#E4E3F2] px-5 py-3 text-sm font-bold text-slate-700 hover:border-primary-300 hover:text-primary-700">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!termsReady || submitting}
                    title={termsReady ? undefined : "Accept all five terms to publish"}
                    className={`rounded-xl px-5 py-3 text-sm font-bold transition motion-safe:duration-150 ${
                      termsReady && !submitting ? "cursor-pointer bg-[#F5C21A] text-[#231C57] hover:bg-[#FFD24D]" : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }`}
                  >
                    {submitting ? "Publishing…" : "Publish listing"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply to an existing listing — reuses the same real
          applyToOpportunity mutation the tutoring/generic marketplace
          views use. */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Submit application</h3>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Cover message / approach</label>
                <textarea
                  rows={4}
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Explain how you plan to help or deliver this…"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedOpp(null)} className="rounded-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                  Cancel
                </button>
                <button type="submit" className="rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700">
                  Send application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  note,
  required,
  invalid,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  note?: string;
  required?: boolean;
  invalid?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type="text"
        placeholder={hint}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 rounded-xl border px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          invalid ? "border-red-300" : "border-[#E4E3F2] focus:border-primary-500"
        }`}
      />
      {note && <span className="text-[11px] font-semibold text-slate-400">{note}</span>}
    </label>
  );
}

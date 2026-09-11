import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageSquare, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 to-primary-700 px-4 py-20 text-white">
        {/* Decorative background blobs — pure CSS, no external image assets */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">All your course resources, in one trusted place</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Past papers, notes, and study help — searchable by university, programme, subject, and year. Built for
            Malaysian university students.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="group rounded-full bg-amber-400 px-6 py-3 font-semibold text-primary-900 transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="inline-flex items-center gap-1.5">
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Feature
            icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
            title="Find resources fast"
            accent="primary"
          >
            Filter by university, programme, subject, year, and category — see if answers are available before you
            download.
          </Feature>
          <Feature
            icon={<MessageSquare className="h-6 w-6" aria-hidden="true" />}
            title="Ask & discuss"
            accent="teal"
          >
            Link a question straight to a forum discussion and see solved threads from other students.
          </Feature>
          <Feature icon={<Users className="h-6 w-6" aria-hidden="true" />} title="Legitimate tutoring" accent="amber">
            Connect with verified tutors for mentoring, proofreading, and guidance — moderated, and never for
            contract cheating.
          </Feature>
        </div>
      </section>
    </div>
  );
}

const ACCENTS = {
  primary: {
    badge: 'bg-primary-100 text-primary-700 group-hover:bg-primary-600 group-hover:text-white',
    border: 'hover:border-primary-300',
    glow: 'group-hover:bg-primary-400/10',
    link: 'text-primary-700',
  },
  teal: {
    badge: 'bg-teal-500/10 text-teal-600 group-hover:bg-teal-500 group-hover:text-white',
    border: 'hover:border-teal-300',
    glow: 'group-hover:bg-teal-400/10',
    link: 'text-teal-600',
  },
  amber: {
    badge: 'bg-amber-400/20 text-amber-500 group-hover:bg-amber-400 group-hover:text-primary-900',
    border: 'hover:border-amber-300',
    glow: 'group-hover:bg-amber-400/10',
    link: 'text-amber-500',
  },
} as const;

function Feature({
  icon,
  title,
  children,
  accent,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  accent: keyof typeof ACCENTS;
}) {
  const colors = ACCENTS[accent];
  return (
    <Link
      to="/register"
      className={`group relative block overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${colors.border}`}
    >
      {/* Soft color wash that fades in behind the card on hover */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-transparent blur-2xl transition-colors duration-300 ${colors.glow}`}
        aria-hidden="true"
      />

      <div className="relative">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110 ${colors.badge}`}
        >
          {icon}
        </div>
        <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{children}</p>
        <span
          className={`mt-4 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${colors.link}`}
        >
          Get started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

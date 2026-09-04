import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div>
      <section className="bg-gradient-to-b from-primary-900 to-primary-700 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">All your course resources, in one trusted place</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Past papers, notes, and study help — searchable by university, programme, subject, and year. Built for
            Malaysian university students.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-primary-900 hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Feature icon={<BookOpen className="h-6 w-6" aria-hidden="true" />} title="Find resources fast">
            Filter by university, programme, subject, year, and category — see if answers are available before you
            download.
          </Feature>
          <Feature icon={<MessageSquare className="h-6 w-6" aria-hidden="true" />} title="Ask & discuss">
            Link a question straight to a forum discussion and see solved threads from other students.
          </Feature>
          <Feature icon={<Users className="h-6 w-6" aria-hidden="true" />} title="Legitimate tutoring">
            Connect with verified tutors for mentoring, proofreading, and guidance — moderated, and never for
            contract cheating.
          </Feature>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  );
}

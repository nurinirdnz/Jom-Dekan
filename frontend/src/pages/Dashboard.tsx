import { useCurrentUser } from '../hooks/useAuth';

export default function Dashboard() {
  const user = useCurrentUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Welcome{user ? `, ${user.email}` : ''} 👋</h1>
      <p className="mt-2 text-slate-600">
        This is the authenticated dashboard shell. Resource browsing, search, forums, favorites, notifications, and
        tutor/opportunity pages arrive in later milestones (see <code>docs/implementation-plan.md</code>).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Browse resources', desc: 'Milestone 3–4' },
          { title: 'Forum & discussions', desc: 'Milestone 5' },
          { title: 'Favorites & collections', desc: 'Milestone 4' },
          { title: 'Notifications', desc: 'Milestone 6' },
          { title: 'Tutor & opportunities', desc: 'Milestone 7' },
          { title: 'Recommendations', desc: 'Milestone 8' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-500">Coming in {card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

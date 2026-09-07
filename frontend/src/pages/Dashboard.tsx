import { Link } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';

const cards = [
  { title: 'Browse Resource', desc: null, to: '/resources' },
  { title: 'Forum & discussions', desc: 'Milestone 5', to: null },
  { title: 'Favorites & collections', desc: 'Milestone 4', to: null },
  { title: 'Notifications', desc: 'Milestone 6', to: null },
  { title: 'Tutor & opportunities', desc: 'Milestone 7', to: null },
  { title: 'Recommendations', desc: 'Milestone 8', to: null },
];

export default function Dashboard() {
  const user = useCurrentUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Welcome{user ? `, ${user.email}` : ''} 👋</h1>
      <p className="mt-2 text-slate-600">
        This is the authenticated dashboard shell. Search, forums, favorites, notifications, and tutor/opportunity
        pages arrive in later milestones (see <code>docs/implementation-plan.md</code>).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) =>
          card.to ? (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
            >
              <h2 className="font-semibold text-slate-800">{card.title}</h2>
              <p className="mt-1 text-sm text-primary-700">Upload, browse, and download academic resources →</p>
            </Link>
          ) : (
            <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-800">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">Coming in {card.desc}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

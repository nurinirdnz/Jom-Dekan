import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/universities", label: "Universities" },
  { to: "/admin/faculties", label: "Faculties" },
  { to: "/admin/programmes", label: "Programmes" },
  { to: "/admin/subjects", label: "Subjects" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Taxonomy admin
        </h2>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${
                  isActive
                    ? "bg-primary-50 font-medium text-primary-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}

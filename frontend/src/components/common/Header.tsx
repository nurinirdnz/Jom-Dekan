import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";
import { NotificationsPopover } from "./NotificationsPopover";

export function Header() {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-primary-700"
        >
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
          <span>JomDekan</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  to="/admin/universities"
                  className="text-slate-700 hover:text-primary-700"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/marketplace"
                className="text-slate-700 hover:text-primary-700"
              >
                Marketplace
              </Link>
              <Link
                to="/dashboard"
                className="text-slate-700 hover:text-primary-700"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-slate-700 hover:text-primary-700"
              >
                Profile
              </Link>
              <NotificationsPopover />
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-700 hover:text-primary-700"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminUsers from "../../pages/admin/AdminUsers";
import AdminUserDetail from "../../pages/admin/AdminUserDetail";
import AdminModerationQueue from "../../pages/admin/AdminModerationQueue";
import AdminOpportunities from "../../pages/admin/AdminOpportunities";

type AdminSection = "users" | "moderation" | "opportunities";

const tabs: { key: AdminSection; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "opportunities", label: "Marketplace" },
  { key: "moderation", label: "Moderation" },
];

export function AdminDashboardPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get("section");
  const initialSection: AdminSection | null =
    requestedSection === "users" ||
    requestedSection === "moderation" ||
    requestedSection === "opportunities"
      ? requestedSection
      : null;
  const [section, setSection] = useState<AdminSection | null>(initialSection);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const toolsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      requestedSection === "users" ||
      requestedSection === "moderation" ||
      requestedSection === "opportunities"
    ) {
      setSection(requestedSection);
      setSelectedUserId(null);
    }
  }, [requestedSection]);

  useEffect(() => {
    if (section) {
      requestAnimationFrame(() =>
        toolsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  }, [section]);

  const changeSection = (nextSection: AdminSection) => {
    setSection(nextSection);
    setSelectedUserId(null);
    setSearchParams({ section: nextSection });
  };

  if (!section) return null;

  return (
    <section ref={toolsRef} aria-label="Admin dashboard tools">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            Dashboard tools
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Users, moderation and marketplace
          </h2>
        </div>
        {section && (
          <nav
            className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            aria-label="Admin dashboard sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeSection(tab.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${section === tab.key ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {section === "users" && selectedUserId ? (
        <AdminUserDetail
          embedded
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
        />
      ) : section === "users" ? (
        <AdminUsers embedded onSelectUser={setSelectedUserId} />
      ) : null}
      {section === "moderation" && <AdminModerationQueue embedded />}
      {section === "opportunities" && <AdminOpportunities embedded />}
    </section>
  );
}

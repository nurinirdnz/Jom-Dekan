import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ImageOff } from "lucide-react";
import { useResources, useImagePreviewUrl } from "../hooks/useResources";
import { useCurrentUser } from "../hooks/useAuth";
import { useUniversities, useFaculties, useProgrammes, useSubjects } from "../hooks/useTaxonomy";
import type { ResourceListItem } from "../types/resource";

const PAGE_SIZE = 12;
type SortBy = "newest" | "oldest" | "title";

function statusBadgeClass(status: ResourceListItem["status"]) {
  if (status === "READY") return "bg-green-100 text-green-700";
  if (status === "PENDING") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-500";
}

function ResourceThumbnail({ resource }: { resource: ResourceListItem }) {
  const isImage = resource.readyFileMimeType?.startsWith("image/") ?? false;
  // Each card fetches its own short-lived signed URL — the backend
  // re-checks visibility on every request, so there's no shortcut that
  // skips that check just because this is a thumbnail, not a download.
  const { data: previewUrl, isLoading } = useImagePreviewUrl(
    isImage ? (resource.readyFileId ?? undefined) : undefined,
  );

  return (
    <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100">
      {isImage ? (
        previewUrl ? (
          <img
            src={previewUrl}
            alt={resource.title}
            className="h-full w-full object-cover"
          />
        ) : isLoading ? (
          <div className="h-full w-full animate-pulse bg-slate-200" />
        ) : (
          <ImageOff className="h-8 w-8 text-slate-300" aria-hidden="true" />
        )
      ) : (
        <FileText className="h-10 w-10 text-slate-300" aria-hidden="true" />
      )}
    </div>
  );
}

export default function Resources() {
  const user = useCurrentUser();
  const [mine, setMine] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [universityId, setUniversityId] = useState<string | undefined>(undefined);
  const [facultyId, setFacultyId] = useState<string | undefined>(undefined);
  const [programmeId, setProgrammeId] = useState<string | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Debounce the search box so every keystroke doesn't trigger a request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setQ(searchInput.trim() || undefined);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data: universities } = useUniversities();
  const { data: faculties } = useFaculties(universityId);
  const { data: programmes } = useProgrammes(facultyId);
  const { data: subjects } = useSubjects();

  const { data, isLoading, isError } = useResources({
    mine,
    universityId,
    facultyId,
    programmeId,
    subjectId,
    q,
    sortBy,
    page,
    pageSize: PAGE_SIZE,
  });
  const resources = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleUniversityChange(value: string) {
    setUniversityId(value || undefined);
    setFacultyId(undefined);
    setProgrammeId(undefined);
    setPage(1);
  }

  function handleFacultyChange(value: string) {
    setFacultyId(value || undefined);
    setProgrammeId(undefined);
    setPage(1);
  }

  function handleProgrammeChange(value: string) {
    setProgrammeId(value || undefined);
    setPage(1);
  }

  function handleSubjectChange(value: string) {
    setSubjectId(value || undefined);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse notes, past papers, and other academic resources shared by
            students.
          </p>
        </div>
        <Link
          to="/resources/upload"
          className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700"
        >
          Upload a resource
        </Link>
      </div>

      {user && (
        <div className="mt-4 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setMine(false);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 font-medium ${
              !mine
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All resources
          </button>
          <button
            type="button"
            onClick={() => {
              setMine(true);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 font-medium ${
              mine
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            My uploads
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search resources…"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as SortBy);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <select
          value={universityId ?? ""}
          onChange={(e) => handleUniversityChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All universities</option>
          {universities?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          value={facultyId ?? ""}
          onChange={(e) => handleFacultyChange(e.target.value)}
          disabled={!universityId}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">All faculties</option>
          {faculties?.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <select
          value={programmeId ?? ""}
          onChange={(e) => handleProgrammeChange(e.target.value)}
          disabled={!facultyId}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">All programmes</option>
          {programmes?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={subjectId ?? ""}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All subjects</option>
          {subjects?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-red-600">
            Could not load resources.
          </p>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <Link
                key={r.id}
                to={`/resources/${r.id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <ResourceThumbnail resource={r} />
                <div className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-slate-800">{r.title}</h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {r.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    Added {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            {q
              ? "No resources match your search."
              : mine
                ? "You haven't uploaded anything yet."
                : "No resources yet — be the first to upload one."}
          </p>
        )}
      </div>

      {resources.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} result{total === 1 ? "" : "s"})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full bg-slate-100 px-4 py-1.5 font-medium text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full bg-slate-100 px-4 py-1.5 font-medium text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

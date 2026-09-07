import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ImageOff } from "lucide-react";
import { useResources, useImagePreviewUrl } from "../hooks/useResources";
import { useCurrentUser } from "../hooks/useAuth";
import type { ResourceListItem } from "../types/resource";

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
  const { data: previewUrl, isLoading } = useImagePreviewUrl(isImage ? (resource.readyFileId ?? undefined) : undefined);

  return (
    <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100">
      {isImage ? (
        previewUrl ? (
          <img src={previewUrl} alt={resource.title} className="h-full w-full object-cover" />
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
  const { data, isLoading, isError } = useResources({ mine });
  const resources = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse notes, past papers, and other academic resources shared by students.
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
        <div className="mt-6 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMine(false)}
            className={`rounded-full px-4 py-1.5 font-medium ${
              !mine ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All resources
          </button>
          <button
            type="button"
            onClick={() => setMine(true)}
            className={`rounded-full px-4 py-1.5 font-medium ${
              mine ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            My uploads
          </button>
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading…</p>
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
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  {r.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{r.description}</p>}
                  <p className="mt-3 text-xs text-slate-400">Added {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            {mine ? "You haven't uploaded anything yet." : "No resources yet — be the first to upload one."}
          </p>
        )}
      </div>
    </div>
  );
}

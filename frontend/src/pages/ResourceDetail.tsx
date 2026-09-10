import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useResource,
  useUpdateResource,
  useSetResourceStatus,
  useDeleteResource,
  useDownloadUrl,
  useImagePreviewUrl,
} from "../hooks/useResources";
import { useCurrentUser } from "../hooks/useAuth";
import { FavoriteButton } from "../components/common/FavoriteButton";

import {
  editResourceFormSchema,
  type EditResourceFormValues,
} from "../schemas/resourceSchemas";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data, isLoading, isError } = useResource(id);
  const updateResource = useUpdateResource();
  const setStatus = useSetResourceStatus();
  const deleteResource = useDeleteResource();
  const downloadUrl = useDownloadUrl();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm<EditResourceFormValues>({
    resolver: zodResolver(editResourceFormSchema),
    values: data
      ? {
          title: data.resource.title,
          description: data.resource.description ?? undefined,
        }
      : undefined,
  });

  const readyFile = data?.files.find((f) => f.status === "READY");
  const isImage = readyFile?.detectedMimeType?.startsWith("image/") ?? false;
  // Hooks must run unconditionally on every render (before the early
  // returns below), so this is fetched here even though it's only
  // rendered further down once `data` is confirmed present.
  const { data: previewUrl } = useImagePreviewUrl(
    isImage ? readyFile?.id : undefined,
  );

  if (isLoading)
    return (
      <p className="mx-auto max-w-3xl px-[18px] py-[22px] text-sm text-slate-500">
        Loading…
      </p>
    );

  if (isError || !data)
    return (
      <div className="mx-auto max-w-3xl px-[18px] py-[22px]">
        <p className="text-sm text-red-600">
          This resource does not exist, or you don't have access to it.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-2 inline-block text-sm text-primary-700 hover:underline"
        >
          ← Back
        </button>
      </div>
    );

  const { resource } = data;
  // UX-only check — the buttons this gates are a convenience, not a
  // security boundary. The server enforces ownership on every request
  // regardless of what this renders.
  const isOwner = user?.id === resource.ownerId;
  const canManage = isOwner || user?.role === "ADMIN";

  const onSave = (values: EditResourceFormValues) => {
    updateResource.mutate(
      { id: resource.id, data: values },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleDownload = (fileId: string) => {
    downloadUrl.mutate(fileId, {
      onSuccess: (url) => window.open(url, "_blank", "noopener,noreferrer"),
    });
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        `Delete "${resource.title}" permanently? This cannot be undone.`,
      )
    )
      return;
    deleteResource.mutate(resource.id, {
      onSuccess: () => navigate("/resources"),
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-[18px] py-[22px]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-primary-700 hover:underline"
      >
        ← Back
      </button>

      <div className="mt-4 rounded-2xl border border-[#ECEBF7] bg-white p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700"
              >
                Title
              </label>
              <input
                id="title"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register("title")}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register("description")}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateResource.isPending}
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setIsEditing(false);
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900">
                {resource.title}
              </h1>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  resource.status === "READY"
                    ? "bg-green-100 text-green-700"
                    : resource.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {resource.status}
              </span>
            </div>
            {resource.description && (
              <p className="mt-2 whitespace-pre-wrap text-slate-600">
                {resource.description}
              </p>
            )}

            {isImage && previewUrl && (
              <img
                src={previewUrl}
                alt={readyFile?.originalFilename ?? resource.title}
                className="mt-4 max-h-96 w-full rounded-lg border border-slate-200 object-contain"
              />
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <FavoriteButton resourceId={resource.id} />
              {readyFile && (
                <button
                  type="button"
                  onClick={() => handleDownload(readyFile.id)}
                  disabled={downloadUrl.isPending}
                  className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {downloadUrl.isPending ? "Preparing download…" : "Download"}
                </button>
              )}
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStatus.mutate({
                        id: resource.id,
                        action:
                          resource.status === "ARCHIVED"
                            ? "RESTORE"
                            : "ARCHIVE",
                      })
                    }
                    disabled={setStatus.isPending}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                  >
                    {resource.status === "ARCHIVED" ? "Restore" : "Archive"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteResource.isPending}
                    className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {deleteResource.isPending ? "Deleting…" : "Delete"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

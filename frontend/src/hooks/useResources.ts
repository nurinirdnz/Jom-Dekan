import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "../service/resourceService";

export function useResources(params: {
  mine?: boolean;
  universityId?: string;
  facultyId?: string;
  programmeId?: string;
  subjectId?: string;
  q?: string;
  sortBy?: "newest" | "oldest" | "title";
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["resources", params],
    queryFn: () => resourceService.list(params),
  });
}

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: ["resources", "detail", id],
    queryFn: () => resourceService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title: string; description?: string };
    }) => resourceService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });
}

export function useSetResourceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "ARCHIVE" | "RESTORE";
    }) => resourceService.setStatus(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourceService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (fileId: string) => resourceService.getDownloadUrl(fileId),
  });
}

/**
 * Auto-fetches a signed preview URL for an image file as soon as the
 * page has one to show (used for the inline <img> preview). Separate
 * from useDownloadUrl (a mutation) because the Download button wants a
 * fresh token fetched right when clicked, not one that might have sat
 * around since page load — this one is fine to go a little stale since
 * a failed <img> load just means "no preview", not a broken download.
 */
export function useImagePreviewUrl(fileId: string | undefined) {
  return useQuery({
    queryKey: ["resources", "preview-url", fileId],
    queryFn: () => resourceService.getDownloadUrl(fileId!),
    enabled: Boolean(fileId),
    staleTime: 4 * 60 * 1000,
  });
}

export function useResourceComments(resourceId: string | undefined) {
  return useQuery({
    queryKey: ["resources", "comments", resourceId],
    queryFn: () => resourceService.listComments(resourceId!),
    enabled: Boolean(resourceId),
  });
}

export function useCreateResourceComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, body }: { resourceId: string; body: string }) =>
      resourceService.createComment(resourceId, body),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["resources", "comments", variables.resourceId],
      }),
  });
}

export function useUpdateResourceComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      body,
      resourceId,
    }: {
      commentId: string;
      body: string;
      resourceId: string;
    }) => {
      void resourceId;
      return resourceService.updateComment(commentId, body);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["resources", "comments", variables.resourceId],
      }),
  });
}

export function useDeleteResourceComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      resourceId,
    }: {
      commentId: string;
      resourceId: string;
    }) => {
      void resourceId;
      return resourceService.removeComment(commentId);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["resources", "comments", variables.resourceId],
      }),
  });
}

interface UploadResourceInput {
  title: string;
  description?: string;
  universityId?: string;
  facultyId?: string;
  programmeId?: string;
  subjectId?: string;
  file: File;
  onProgress?: (percent: number) => void;
}

/** Chains upload-intent -> PUT file (with progress) -> confirm, in one mutation. */
export function useUploadResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadResourceInput) => {
      const intent = await resourceService.createUploadIntent({
        title: input.title,
        description: input.description,
        universityId: input.universityId,
        facultyId: input.facultyId,
        programmeId: input.programmeId,
        subjectId: input.subjectId,
        fileName: input.file.name,
        contentType: input.file.type,
        sizeBytes: input.file.size,
      });
      await resourceService.uploadFile(
        intent.uploadUrl,
        input.file,
        input.onProgress,
      );
      return resourceService.confirmUpload(intent.file.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });
}

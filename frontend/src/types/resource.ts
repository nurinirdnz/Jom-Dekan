export type ResourceStatus = "PENDING" | "READY" | "ARCHIVED" | "FAILED";
export type ResourceFileStatus = "PENDING" | "UPLOADED" | "READY" | "FAILED";

export interface Resource {
  id: string;
  ownerId: string;
  universityId: string | null;
  facultyId: string | null;
  programmeId: string | null;
  subjectId: string | null;
  title: string;
  description: string | null;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

// The browse-list endpoint carries a bit more than a single-resource
// fetch: just enough to render a thumbnail without a per-card lookup.
export interface ResourceListItem extends Resource {
  readyFileId: string | null;
  readyFileMimeType: string | null;
}

export interface ResourceFile {
  id: string;
  resourceId: string;
  originalFilename: string;
  declaredMimeType: string;
  detectedMimeType: string | null;
  sizeBytes: number;
  status: ResourceFileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceListMeta {
  page: number;
  pageSize: number;
  total: number;
}

export const ALLOWED_RESOURCE_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;

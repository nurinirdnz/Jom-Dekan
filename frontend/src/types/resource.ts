export type ResourceStatus = "PENDING" | "READY" | "ARCHIVED" | "FAILED";
export type ResourceFileStatus = "PENDING" | "UPLOADED" | "READY" | "FAILED";
export type ResourceCategory =
  | "PAST_PAPER"
  | "NOTES"
  | "SLIDES"
  | "ARTICLE"
  | "EXCEL";

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "PAST_PAPER",
  "NOTES",
  "SLIDES",
  "ARTICLE",
  "EXCEL",
];

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  PAST_PAPER: "Past paper",
  NOTES: "Notes",
  SLIDES: "Slides",
  ARTICLE: "Article",
  EXCEL: "Excel",
};

export interface Resource {
  id: string;
  ownerId: string;
  universityId: string | null;
  facultyId: string | null;
  programmeId: string | null;
  subjectId: string | null;
  title: string;
  description: string | null;
  category: ResourceCategory;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

// The browse-list endpoint carries a bit more than a single-resource
// fetch: just enough to render a thumbnail without a per-card lookup,
// plus the uploader's display name for the byline.
export interface ResourceListItem extends Resource {
  readyFileId: string | null;
  readyFileMimeType: string | null;
  ownerName: string | null;
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

export interface ResourceComment {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceListMeta {
  page: number;
  pageSize: number;
  total: number;
}

export const ALLOWED_RESOURCE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
] as const;

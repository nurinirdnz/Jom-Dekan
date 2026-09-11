import type { ResourceListItem } from "../types/resource";

export const FILE_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  "application/pdf": { label: "PDF", className: "bg-[#EFEEFB] text-[#4338CA]" },
  "image/jpeg": { label: "JPEG", className: "bg-[#FDF3DA] text-[#8A6A00]" },
  "image/png": { label: "PNG", className: "bg-[#FDF3DA] text-[#8A6A00]" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    label: "DOCX",
    className: "bg-[#E4F1FB] text-[#1D5E8A]",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    label: "XLSX",
    className: "bg-[#E4F5EC] text-[#1B7A55]",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    label: "PPTX",
    className: "bg-[#FBEAE5] text-[#B5461E]",
  },
};
export const TEXT_BADGE = { label: "TEXT", className: "bg-[#E4F1FB] text-[#1D5E8A]" };

export function fileTypeBadge(resource: ResourceListItem) {
  if (!resource.readyFileId) return TEXT_BADGE;
  return (
    (resource.readyFileMimeType && FILE_TYPE_BADGE[resource.readyFileMimeType]) || {
      label: "FILE",
      className: "bg-slate-100 text-slate-500",
    }
  );
}

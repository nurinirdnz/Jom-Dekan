export type ReportTargetType = "resource" | "forum_post" | "opportunity";

export type ReportCategory =
  | "INAPPROPRIATE_CONTENT"
  | "COPYRIGHT_VIOLATION"
  | "PLAGIARISM"
  | "ACADEMIC_DISHONESTY"
  | "SPAM_OR_SCAM"
  | "HARASSMENT"
  | "MISINFORMATION"
  | "OTHER";

export const REPORT_CATEGORIES: ReportCategory[] = [
  "INAPPROPRIATE_CONTENT",
  "COPYRIGHT_VIOLATION",
  "PLAGIARISM",
  "ACADEMIC_DISHONESTY",
  "SPAM_OR_SCAM",
  "HARASSMENT",
  "MISINFORMATION",
  "OTHER",
];

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  COPYRIGHT_VIOLATION: "Illegal / copyright violation",
  PLAGIARISM: "Plagiarism",
  ACADEMIC_DISHONESTY: "Academic dishonesty / contract cheating",
  SPAM_OR_SCAM: "Spam or scam",
  HARASSMENT: "Harassment or bullying",
  MISINFORMATION: "Misinformation",
  OTHER: "Other",
};

export interface Report {
  id: string;
  entityType: ReportTargetType;
  entityId: string;
  reporterId: string | null;
  category: ReportCategory;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

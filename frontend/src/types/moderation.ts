export interface Notification {
  id: string;
  type: string;
  payload: { message?: string; [key: string]: unknown };
  read_at: string | null;
  created_at: string;
}

export type ModerationEntityType = "resource" | "report";

export interface ModerationQueueItem {
  id: string;
  entity_type: ModerationEntityType;
  entity_id: string;
  details: string;
  moderation_status: string;
  created_at: string;
}

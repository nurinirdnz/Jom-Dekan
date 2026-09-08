export type ModerationEntityType = "resource" | "report";

export interface ModerationQueueItem {
  id: string;
  entity_type: ModerationEntityType;
  entity_id: string;
  details: string;
  moderation_status: string;
  created_at: string;
}

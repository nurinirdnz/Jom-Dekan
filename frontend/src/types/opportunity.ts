export type OpportunityListingType = "TUTORING" | "STUDY_GROUP" | "PROJECT_MENTORSHIP";
export type OpportunityMode = "ONLINE" | "PHYSICAL" | "HYBRID";
export type OpportunityStatus = "active" | "closed";

export interface Opportunity {
  id: string;
  owner_id: string;
  owner_name: string | null;
  subject_id: string | null;
  subject_code: string | null;
  subject_name: string | null;
  title: string;
  description: string;
  listing_type: OpportunityListingType;
  mode: OpportunityMode;
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
}

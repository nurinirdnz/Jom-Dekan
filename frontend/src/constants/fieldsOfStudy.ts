/**
 * Fixed, general list of fields of study — the same 27 options apply
 * regardless of which university a student picks. Kept in sync with
 * backend/src/constants/fieldsOfStudy.ts and the CHECK constraint on
 * user_profiles.field_of_study (see database/migrations/008).
 */
export const FIELDS_OF_STUDY = [
  'Accounting and finance',
  'Agriculture, forestry, fisheries and veterinary',
  'Architecture and building',
  'Arts and design',
  'Audio-visual techniques and media production',
  'Business and administration',
  'Communication and broadcasting',
  'Computing',
  'Education',
  'Engineering and engineering trades',
  'Environmental protection and conservation',
  'Hospitality and tourism',
  'Humanities',
  'Languages',
  'Law',
  'Manufacturing and processing',
  'Marketing and sales',
  'Mathematics and statistics',
  'Medicine and health',
  'Medical diagnostic and treatment technology',
  'Occupational health and safety',
  'Personal services',
  'Science (Biological sciences and physical sciences)',
  'Security and protective services',
  'Social sciences',
  'Social services',
  'Transport services',
] as const;

export type FieldOfStudy = (typeof FIELDS_OF_STUDY)[number];

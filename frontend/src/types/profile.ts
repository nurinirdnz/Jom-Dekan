export interface Profile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  termsAcceptedAt: string | null;
  displayName: string;
  photoPath: string | null;
  academicRole: 'STUDENT' | 'TUTOR';
  university: { id: string; name: string | null } | null;
  fieldOfStudy: string | null;
  studyLevel: string | null;
  currentYear: number | null;
  currentSemester: number | null;
  createdAt: string;
}

export interface ProfileStats {
  resourceCount: number;
  forumPostCount: number;
  forumCommentCount: number;
}

export interface UpdateProfileInput {
  displayName?: string;
  academicRole?: 'STUDENT' | 'TUTOR';
  universityId?: string;
  fieldOfStudy?: string;
  currentYear?: number;
  currentSemester?: number;
}

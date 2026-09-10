import { profileModel, toApiProfile, toApiStats } from '../models/profileModel';
import { taxonomyModel } from '../models/taxonomyModel';
import { AppError } from '../types/errors';

export const profileService = {
  async getMyProfile(userId: string) {
    const profile = await profileModel.findByUserId(userId);
    if (!profile) {
      throw AppError.notFound('Profile not found.');
    }
    return toApiProfile(profile);
  },

  async updateMyProfile(
    userId: string,
    fields: Partial<{
      displayName: string;
      academicRole: 'STUDENT' | 'TUTOR';
      universityId: string;
      fieldOfStudy: string;
      currentYear: number;
      currentSemester: number;
    }>,
  ) {
    if (fields.universityId) {
      const university = await taxonomyModel.universities.findById(fields.universityId);
      if (!university || !university.is_active) {
        throw AppError.badRequest('Select a valid university.');
      }
    }

    const profile = await profileModel.update(userId, fields);
    if (!profile) {
      throw AppError.notFound('Profile not found.');
    }
    return toApiProfile(profile);
  },

  async getMyStats(userId: string) {
    const stats = await profileModel.getStats(userId);
    return toApiStats(stats);
  },
};

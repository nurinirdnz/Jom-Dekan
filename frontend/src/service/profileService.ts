import axiosInstance from '../api/axiosInstance';
import type { Profile, ProfileStats, UpdateProfileInput } from '../types/profile';

export const profileService = {
  getMe: async (): Promise<Profile> => {
    const response = await axiosInstance.get<{ data: Profile }>('/users/me');
    return response.data.data;
  },

  updateMe: async (data: UpdateProfileInput): Promise<Profile> => {
    const response = await axiosInstance.patch<{ data: Profile }>('/users/me', data);
    return response.data.data;
  },

  getMyStats: async (): Promise<ProfileStats> => {
    const response = await axiosInstance.get<{ data: ProfileStats }>('/users/me/stats');
    return response.data.data;
  },
};

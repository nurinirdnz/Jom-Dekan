import axiosInstance from '../api/axiosInstance';
import type { AuthResponse, User } from '../types/auth';

/**
 * Components/pages never call Axios directly — every API call goes
 * through a service file like this one, consumed via hooks/TanStack
 * Query.
 */
export const authService = {
  register: async (data: { email: string; password: string; displayName: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string; user: User }> => {
    const response = await axiosInstance.post<{ accessToken: string; user: User }>('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await axiosInstance.get<{ user: User }>('/auth/me');
    return response.data;
  },
};

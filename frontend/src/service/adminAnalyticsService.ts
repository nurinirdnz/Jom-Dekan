import axiosInstance from "../api/axiosInstance";
import type { AdminAnalytics } from "../types/adminAnalytics";

export const adminAnalyticsService = {
  async getOverview(): Promise<AdminAnalytics> {
    const response = await axiosInstance.get<{ data: AdminAnalytics }>(
      "/admin/analytics/overview",
    );
    return response.data.data;
  },
};

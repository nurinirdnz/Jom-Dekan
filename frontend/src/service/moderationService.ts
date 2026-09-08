import axiosInstance from "../api/axiosInstance";

export const moderationService = {
  async getNotifications() {
    const { data } = await axiosInstance.get("/api/v1/notifications");
    return data.data;
  },
  async markNotificationAsRead(id: string) {
    const { data } = await axiosInstance.patch(
      `/api/v1/notifications/${id}/read`,
    );
    return data.data;
  },
  async getModerationQueue() {
    const { data } = await axiosInstance.get("/api/v1/admin/moderation/queue");
    return data.data;
  },
  async handleModerationAction(
    targetType: string,
    id: string,
    action: string,
    reason: string,
  ) {
    const { data } = await axiosInstance.patch(
      `/api/v1/admin/${targetType}/${id}/status`,
      { action, reason },
    );
    return data.data;
  },
  async getOpportunities() {
    const { data } = await axiosInstance.get("/api/v1/opportunities");
    return data.data;
  },
};

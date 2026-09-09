import axiosInstance from "../api/axiosInstance";

export const moderationService = {
  async getNotifications() {
    const { data } = await axiosInstance.get("/notifications");
    return data.data;
  },
  async markNotificationAsRead(id: string) {
    const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
    return data.data;
  },
  async getModerationQueue() {
    const { data } = await axiosInstance.get("/admin/moderation/queue");
    return data.data;
  },
  async handleModerationAction(
    targetType: string,
    id: string,
    action: string,
    reason: string,
  ) {
    const { data } = await axiosInstance.patch(
      `/admin/${targetType}/${id}/status`,
      { action, reason },
    );
    return data.data;
  },
};

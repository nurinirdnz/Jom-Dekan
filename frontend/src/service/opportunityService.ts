import axiosInstance from "../api/axiosInstance";

export const opportunityService = {
  async getOpportunities() {
    const { data } = await axiosInstance.get("/api/v1/opportunities");
    return data.data;
  },
  async createOpportunity(payload: {
    title: string;
    description: string;
    subjectId?: string;
    listingType: string;
    mode: string;
  }) {
    const { data } = await axiosInstance.post("/api/v1/opportunities", payload);
    return data.data;
  },
  async applyToOpportunity(opportunityId: string, coverMessage: string) {
    const { data } = await axiosInstance.post(
      `/api/v1/opportunities/${opportunityId}/applications`,
      { coverMessage },
    );
    return data.data;
  },
};

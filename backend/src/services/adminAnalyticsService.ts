import { adminAnalyticsModel } from "../models/adminAnalyticsModel";

export const adminAnalyticsService = {
  getOverview: () => adminAnalyticsModel.getOverview(),
};
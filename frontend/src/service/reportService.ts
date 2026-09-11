import axiosInstance from "../api/axiosInstance";
import type { Report, ReportCategory, ReportTargetType } from "../types/report";

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  category: ReportCategory;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  description: string;
}

export const reportService = {
  create: async (data: CreateReportInput): Promise<Report> => {
    const res = await axiosInstance.post<{ data: Report }>("/reports", data);
    return res.data.data;
  },
};

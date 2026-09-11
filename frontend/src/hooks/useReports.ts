import { useMutation } from "@tanstack/react-query";
import { reportService, type CreateReportInput } from "../service/reportService";

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: CreateReportInput) => reportService.create(data),
  });
}

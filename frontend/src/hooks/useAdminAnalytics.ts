import { useQuery } from "@tanstack/react-query";
import { adminAnalyticsService } from "../service/adminAnalyticsService";

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: adminAnalyticsService.getOverview,
    staleTime: 60_000,
  });
}

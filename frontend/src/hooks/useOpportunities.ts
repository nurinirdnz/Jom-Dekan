import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { opportunityService } from "../service/opportunityService";

export function useOpportunities() {
  const queryClient = useQueryClient();

  const opportunitiesQuery = useQuery({
    queryKey: ["opportunities"],
    queryFn: opportunityService.getOpportunities,
  });

  const createMutation = useMutation({
    mutationFn: opportunityService.createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });

  const applyMutation = useMutation({
    mutationFn: ({
      opportunityId,
      coverMessage,
    }: {
      opportunityId: string;
      coverMessage: string;
    }) => opportunityService.applyToOpportunity(opportunityId, coverMessage),
    onSuccess: () => {
      alert("Application submitted successfully!");
    },
  });

  return {
    opportunities: opportunitiesQuery.data || [],
    isLoading: opportunitiesQuery.isLoading,
    error: opportunitiesQuery.error,
    createOpportunity: createMutation.mutateAsync,
    applyToOpportunity: applyMutation.mutateAsync,
  };
}

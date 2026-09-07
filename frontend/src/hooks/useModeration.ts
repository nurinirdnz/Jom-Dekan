import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationService } from "../service/moderationService";

export function useModeration() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: moderationService.getNotifications,
  });

  const queueQuery = useQuery({
    queryKey: ["moderationQueue"],
    queryFn: moderationService.getModerationQueue,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => moderationService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const moderationActionMutation = useMutation({
    mutationFn: ({
      targetType,
      id,
      action,
      reason,
    }: {
      targetType: string;
      id: string;
      action: string;
      reason: string;
    }) =>
      moderationService.handleModerationAction(targetType, id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderationQueue"] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoadingNotifications: notificationsQuery.isLoading,
    queue: queueQuery.data || [],
    isLoadingQueue: queueQuery.isLoading,
    markAsRead: markReadMutation.mutateAsync,
    handleAction: moderationActionMutation.mutateAsync,
  };
}

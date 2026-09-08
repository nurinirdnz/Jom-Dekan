import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "../service/favoriteService";

export function useFavoriteStatus(resourceId: string | undefined) {
  return useQuery({
    queryKey: ["favorites", "status", resourceId],
    queryFn: () => favoriteService.checkStatus(resourceId!),
    enabled: Boolean(resourceId),
  });
}

export function useFavorites(
  params: { page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: ["favorites", "list", params],
    queryFn: () => favoriteService.list(params),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => favoriteService.add(resourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => favoriteService.remove(resourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

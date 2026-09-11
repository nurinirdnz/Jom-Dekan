import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "../service/favoriteService";
import type { FavoriteTargetType } from "../types/favorite";

export function useFavoriteStatus(targetType: FavoriteTargetType, targetId: string | undefined) {
  return useQuery({
    queryKey: ["favorites", "status", targetType, targetId],
    queryFn: () => favoriteService.checkStatus(targetType, targetId!),
    enabled: Boolean(targetId),
  });
}

/** Resource favorites specifically — kept as its own hook since callers
 * (the Resources page, the dashboard summary card) only ever deal with
 * resources and shouldn't have to pass a literal "resource" everywhere. */
export function useFavorites(params: { page?: number; pageSize?: number; enabled?: boolean } = {}) {
  const { enabled = true, ...query } = params;
  return useQuery({
    queryKey: ["favorites", "list", "resource", query],
    queryFn: () => favoriteService.listResources(query),
    enabled,
  });
}

export function useFavoritedForumPosts(
  params: { page?: number; pageSize?: number; enabled?: boolean } = {},
) {
  const { enabled = true, ...query } = params;
  return useQuery({
    queryKey: ["favorites", "list", "forum_post", query],
    queryFn: () => favoriteService.listForumPosts(query),
    enabled,
  });
}

export function useFavoritedOpportunities(
  params: { page?: number; pageSize?: number; enabled?: boolean } = {},
) {
  const { enabled = true, ...query } = params;
  return useQuery({
    queryKey: ["favorites", "list", "opportunity", query],
    queryFn: () => favoriteService.listOpportunities(query),
    enabled,
  });
}

// Optimistic: flips the heart instantly (before the request resolves)
// rather than waiting for a round trip + refetch before anything on
// screen changes. Rolls back to whatever the cache held before if the
// request actually fails.
interface FavoriteMutationVars {
  targetType: FavoriteTargetType;
  targetId: string;
}
interface FavoriteMutationContext {
  key: readonly [string, string, FavoriteTargetType, string];
  previous: boolean | undefined;
}

function useSetFavoriteStatus(nextStatus: boolean) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, FavoriteMutationVars, FavoriteMutationContext>({
    mutationFn: async ({ targetType, targetId }) => {
      if (nextStatus) await favoriteService.add(targetType, targetId);
      else await favoriteService.remove(targetType, targetId);
    },
    onMutate: async ({ targetType, targetId }) => {
      const key = ["favorites", "status", targetType, targetId] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<boolean>(key);
      queryClient.setQueryData(key, nextStatus);
      return { key, previous };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useAddFavorite() {
  return useSetFavoriteStatus(true);
}

export function useRemoveFavorite() {
  return useSetFavoriteStatus(false);
}

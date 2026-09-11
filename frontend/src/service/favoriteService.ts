import axiosInstance from "../api/axiosInstance";
import type {
  Favorite,
  FavoriteTargetType,
  FavoriteResourceItem,
  FavoriteForumPostItem,
  FavoriteOpportunityItem,
  FavoriteListMeta,
} from "../types/favorite";

interface ListFavoritesParams {
  targetType: FavoriteTargetType;
  page?: number;
  pageSize?: number;
}

export const favoriteService = {
  add: async (targetType: FavoriteTargetType, targetId: string): Promise<Favorite> => {
    const res = await axiosInstance.post<{ data: Favorite }>("/favorites", {
      targetType,
      targetId,
    });
    return res.data.data;
  },

  remove: async (targetType: FavoriteTargetType, targetId: string): Promise<void> => {
    await axiosInstance.delete(`/favorites/${targetType}/${targetId}`);
  },

  checkStatus: async (targetType: FavoriteTargetType, targetId: string): Promise<boolean> => {
    const res = await axiosInstance.get<{ data: { isFavorited: boolean } }>(
      `/favorites/${targetType}/${targetId}`,
    );
    return res.data.data.isFavorited;
  },

  listResources: async (
    params: Omit<ListFavoritesParams, "targetType">,
  ): Promise<{ data: FavoriteResourceItem[]; meta: FavoriteListMeta }> => {
    const res = await axiosInstance.get<{ data: FavoriteResourceItem[]; meta: FavoriteListMeta }>(
      "/favorites",
      { params: { ...params, targetType: "resource" } },
    );
    return res.data;
  },

  listForumPosts: async (
    params: Omit<ListFavoritesParams, "targetType">,
  ): Promise<{ data: FavoriteForumPostItem[]; meta: FavoriteListMeta }> => {
    const res = await axiosInstance.get<{ data: FavoriteForumPostItem[]; meta: FavoriteListMeta }>(
      "/favorites",
      { params: { ...params, targetType: "forum_post" } },
    );
    return res.data;
  },

  listOpportunities: async (
    params: Omit<ListFavoritesParams, "targetType">,
  ): Promise<{ data: FavoriteOpportunityItem[]; meta: FavoriteListMeta }> => {
    const res = await axiosInstance.get<{ data: FavoriteOpportunityItem[]; meta: FavoriteListMeta }>(
      "/favorites",
      { params: { ...params, targetType: "opportunity" } },
    );
    return res.data;
  },
};

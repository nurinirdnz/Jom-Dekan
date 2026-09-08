import axiosInstance from "../api/axiosInstance";
import type {
  Favorite,
  FavoriteListItem,
  FavoriteListMeta,
} from "../types/favorite";

interface ListFavoritesParams {
  page?: number;
  pageSize?: number;
}

export const favoriteService = {
  add: async (resourceId: string): Promise<Favorite> => {
    const res = await axiosInstance.post<{ data: Favorite }>("/favorites", {
      resourceId,
    });
    return res.data.data;
  },

  remove: async (resourceId: string): Promise<void> => {
    await axiosInstance.delete(`/favorites/${resourceId}`);
  },

  checkStatus: async (resourceId: string): Promise<boolean> => {
    const res = await axiosInstance.get<{ data: { isFavorited: boolean } }>(
      `/favorites/${resourceId}`,
    );
    return res.data.data.isFavorited;
  },

  list: async (
    params: ListFavoritesParams,
  ): Promise<{ data: FavoriteListItem[]; meta: FavoriteListMeta }> => {
    const res = await axiosInstance.get<{
      data: FavoriteListItem[];
      meta: FavoriteListMeta;
    }>("/favorites", {
      params,
    });
    return res.data;
  },
};

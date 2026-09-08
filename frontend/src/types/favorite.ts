import type { ResourceListItem } from "./resource";

export interface Favorite {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface FavoriteListItem {
  favoriteId: string;
  favoritedAt: string;
  resource: ResourceListItem;
}

export interface FavoriteListMeta {
  page: number;
  pageSize: number;
  total: number;
}

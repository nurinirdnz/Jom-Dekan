import type { ResourceListItem } from "./resource";
import type { ForumPostListItem } from "./forum";
import type { Opportunity } from "./opportunity";

export type FavoriteTargetType = "resource" | "forum_post" | "opportunity";

export interface Favorite {
  id: string;
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
  createdAt: string;
}

export interface FavoriteResourceItem {
  favoriteId: string;
  favoritedAt: string;
  resource: ResourceListItem;
}

export interface FavoriteForumPostItem {
  favoriteId: string;
  favoritedAt: string;
  post: ForumPostListItem;
}

export interface FavoriteOpportunityItem {
  favoriteId: string;
  favoritedAt: string;
  opportunity: Opportunity;
}

export interface FavoriteListMeta {
  page: number;
  pageSize: number;
  total: number;
}

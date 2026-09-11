import axiosInstance from "../api/axiosInstance";
import type {
  ForumPost,
  ForumPostListItem,
  ForumPostListMeta,
  ForumComment,
  ForumCommentListItem,
  VoteTargetType,
} from "../types/forum";

interface ListPostsParams {
  mine?: boolean;
  unanswered?: boolean;
  solved?: boolean;
  sortBy?: "newest" | "oldest" | "top";
  page?: number;
  pageSize?: number;
}

export const forumService = {
  createPost: async (data: {
    title: string;
    body: string;
  }): Promise<ForumPost> => {
    const res = await axiosInstance.post<{ data: ForumPost }>(
      "/forum/posts",
      data,
    );
    return res.data.data;
  },

  listPosts: async (
    params: ListPostsParams,
  ): Promise<{ data: ForumPostListItem[]; meta: ForumPostListMeta }> => {
    const res = await axiosInstance.get<{
      data: ForumPostListItem[];
      meta: ForumPostListMeta;
    }>("/forum/posts", {
      params,
    });
    return res.data;
  },

  getPost: async (postId: string): Promise<ForumPostListItem> => {
    const res = await axiosInstance.get<{ data: ForumPostListItem }>(
      `/forum/posts/${postId}`,
    );
    return res.data.data;
  },

  updatePost: async (
    postId: string,
    data: { title: string; body: string },
  ): Promise<ForumPost> => {
    const res = await axiosInstance.put<{ data: ForumPost }>(
      `/forum/posts/${postId}`,
      data,
    );
    return res.data.data;
  },

  removePost: async (postId: string): Promise<void> => {
    await axiosInstance.delete(`/forum/posts/${postId}`);
  },

  setPostSolved: async (postId: string, solved: boolean): Promise<ForumPost> => {
    const res = await axiosInstance.patch<{ data: ForumPost }>(
      `/forum/posts/${postId}/solved`,
      { solved },
    );
    return res.data.data;
  },

  createComment: async (
    postId: string,
    body: string,
  ): Promise<ForumComment> => {
    const res = await axiosInstance.post<{ data: ForumComment }>(
      `/forum/posts/${postId}/comments`,
      { body },
    );
    return res.data.data;
  },

  listComments: async (postId: string): Promise<ForumCommentListItem[]> => {
    const res = await axiosInstance.get<{ data: ForumCommentListItem[] }>(
      `/forum/posts/${postId}/comments`,
    );
    return res.data.data;
  },

  updateComment: async (
    commentId: string,
    body: string,
  ): Promise<ForumComment> => {
    const res = await axiosInstance.put<{ data: ForumComment }>(
      `/forum/comments/${commentId}`,
      { body },
    );
    return res.data.data;
  },

  removeComment: async (commentId: string): Promise<void> => {
    await axiosInstance.delete(`/forum/comments/${commentId}`);
  },

  castVote: async (
    targetType: VoteTargetType,
    targetId: string,
    value: 1 | -1,
  ): Promise<void> => {
    await axiosInstance.post("/forum/votes", { targetType, targetId, value });
  },

  removeVote: async (
    targetType: VoteTargetType,
    targetId: string,
  ): Promise<void> => {
    await axiosInstance.delete("/forum/votes", {
      data: { targetType, targetId },
    });
  },
};

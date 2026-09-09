export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPostListItem extends ForumPost {
  voteScore: number;
  myVote: number;
  commentCount: number;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCommentListItem extends ForumComment {
  voteScore: number;
  myVote: number;
}

export interface ForumPostListMeta {
  page: number;
  pageSize: number;
  total: number;
}

export type VoteTargetType = "forum_post" | "forum_comment";

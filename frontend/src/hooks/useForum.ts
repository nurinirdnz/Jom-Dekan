import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forumService } from "../service/forumService";
import type { VoteTargetType } from "../types/forum";

export function usePosts(
  params: {
    mine?: boolean;
    unanswered?: boolean;
    solved?: boolean;
    sortBy?: "newest" | "oldest" | "top";
    page?: number;
    pageSize?: number;
  } = {},
) {
  return useQuery({
    queryKey: ["forum", "posts", params],
    queryFn: () => forumService.listPosts(params),
  });
}

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: ["forum", "posts", "detail", postId],
    queryFn: () => forumService.getPost(postId!),
    enabled: Boolean(postId),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; body: string }) =>
      forumService.createPost(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: { title: string; body: string };
    }) => forumService.updatePost(postId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useSetPostSolved() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, solved }: { postId: string; solved: boolean }) =>
      forumService.setPostSolved(postId, solved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => forumService.removePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: ["forum", "comments", postId],
    queryFn: () => forumService.listComments(postId!),
    enabled: Boolean(postId),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) =>
      forumService.createComment(postId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      forumService.updateComment(commentId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => forumService.removeComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
      value,
    }: {
      targetType: VoteTargetType;
      targetId: string;
      value: 1 | -1;
    }) => forumService.castVote(targetType, targetId, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

export function useRemoveVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
    }: {
      targetType: VoteTargetType;
      targetId: string;
    }) => forumService.removeVote(targetType, targetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum"] }),
  });
}

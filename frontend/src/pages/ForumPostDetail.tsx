import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  usePost,
  useComments,
  useUpdatePost,
  useDeletePost,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "../hooks/useForum";
import { useCurrentUser } from "../hooks/useAuth";
import { VoteButtons } from "../components/common/VoteButtons";

export default function ForumPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data: post, isLoading, isError } = usePost(id);
  const { data: comments } = useComments(id);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");

  if (isLoading)
    return (
      <p className="mx-auto max-w-3xl px-[18px] py-[22px] text-sm text-slate-500">
        Loading…
      </p>
    );
  if (isError || !post)
    return (
      <div className="mx-auto max-w-3xl px-[18px] py-[22px]">
        <p className="text-sm text-red-600">
          This post does not exist, or it has been deleted.
        </p>
        <Link
          to="/forum"
          className="mt-2 inline-block text-sm text-primary-700 hover:underline"
        >
          Back to discussions
        </Link>
      </div>
    );

  const isOwner = user?.id === post.authorId;
  const canManage = isOwner || user?.role === "ADMIN";

  const startEditing = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePost.mutate(
      { postId: post.id, data: { title: editTitle, body: editBody } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleDeletePost = () => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`))
      return;
    deletePost.mutate(post.id, { onSuccess: () => navigate("/forum") });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    createComment.mutate(
      { postId: post.id, body: commentBody },
      { onSuccess: () => setCommentBody("") },
    );
  };

  const startEditingComment = (commentId: string, body: string) => {
    setEditingCommentId(commentId);
    setEditingCommentBody(body);
  };

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommentId) return;
    updateComment.mutate(
      { commentId: editingCommentId, body: editingCommentBody },
      { onSuccess: () => setEditingCommentId(null) },
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    deleteComment.mutate(commentId);
  };

  return (
    <div className="mx-auto max-w-3xl px-[18px] py-[22px]">
      <Link to="/forum" className="text-sm text-primary-700 hover:underline">
        ← Back to discussions
      </Link>

      <div className="mt-4 rounded-2xl border border-[#ECEBF7] bg-white p-6">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700"
              >
                Title
              </label>
              <input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-slate-700"
              >
                Body
              </label>
              <textarea
                id="body"
                rows={5}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatePost.isPending}
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <VoteButtons
                targetType="forum_post"
                targetId={post.id}
                voteScore={post.voteScore}
                myVote={post.myVote}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {post.title}
                </h1>
                <p className="mt-2 whitespace-pre-wrap text-slate-600">
                  {post.body}
                </p>
              </div>
            </div>

            {canManage && (
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeletePost}
                  disabled={deletePost.isPending}
                  className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  {deletePost.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-800">Comments</h2>

        <form onSubmit={handleAddComment} className="mt-3 flex flex-col gap-2">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Add a comment…"
            required
            rows={3}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={createComment.isPending}
            className="self-start rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {createComment.isPending ? "Posting…" : "Comment"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          {(comments ?? []).map((comment) => {
            const commentCanManage =
              user?.id === comment.authorId || user?.role === "ADMIN";
            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-2xl border border-[#ECEBF7] bg-white p-4"
              >
                <VoteButtons
                  targetType="forum_comment"
                  targetId={comment.id}
                  voteScore={comment.voteScore}
                  myVote={comment.myVote}
                />
                <div className="flex-1">
                  {editingCommentId === comment.id ? (
                    <form
                      onSubmit={handleSaveComment}
                      className="flex flex-col gap-2"
                    >
                      <textarea
                        value={editingCommentBody}
                        onChange={(e) => setEditingCommentBody(e.target.value)}
                        rows={2}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={updateComment.isPending}
                          className="rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {comment.body}
                      </p>
                      {commentCanManage && (
                        <div className="mt-2 flex gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() =>
                              startEditingComment(comment.id, comment.body)
                            }
                            className="text-primary-700 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-700 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {(comments ?? []).length === 0 && (
            <p className="rounded-2xl border border-[#ECEBF7] bg-white p-4 text-sm text-slate-500">
              No comments yet — be the first to reply.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

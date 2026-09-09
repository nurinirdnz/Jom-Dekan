import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { usePosts, useCreatePost } from "../hooks/useForum";
import { VoteButtons } from "../components/common/VoteButtons";

const PAGE_SIZE = 12;
type SortBy = "newest" | "oldest" | "top";

export default function Forum() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading, isError } = usePosts({
    sortBy,
    page,
    pageSize: PAGE_SIZE,
  });
  const createPost = useCreatePost();
  const posts = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(
      { title, body },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setIsCreating(false);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forum</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions, share discussion, and help each other out.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700"
        >
          {isCreating ? "Cancel" : "New post"}
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            minLength={2}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            required
            rows={4}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={createPost.isPending}
            className="self-start rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {createPost.isPending ? "Posting…" : "Post"}
          </button>
        </form>
      )}

      <div className="mt-6">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as SortBy);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="top">Top voted</option>
        </select>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Loading…
          </p>
        ) : isError ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-red-600">
            Could not load posts.
          </p>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <VoteButtons
                targetType="forum_post"
                targetId={post.id}
                voteScore={post.voteScore}
                myVote={post.myVote}
              />
              <Link to={`/forum/${post.id}`} className="flex-1">
                <h2 className="font-semibold text-slate-800 hover:text-primary-700">
                  {post.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {post.body}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.commentCount} comment
                  {post.commentCount === 1 ? "" : "s"}
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No posts yet — be the first to start a discussion.
          </p>
        )}
      </div>

      {posts.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} result{total === 1 ? "" : "s"})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full bg-slate-100 px-4 py-1.5 font-medium text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full bg-slate-100 px-4 py-1.5 font-medium text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

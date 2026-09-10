import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, Plus, MessageCircle, CircleHelp } from "lucide-react";
import { usePosts, useCreatePost } from "../hooks/useForum";
import { VoteButtons } from "../components/common/VoteButtons";
import { EmptyState } from "../components/common/EmptyState";
import { ForumPostSkeleton } from "../components/forum/ForumPostSkeleton";
import type { ForumPostListItem } from "../types/forum";

const PAGE_SIZE = 12;
const EMPTY_POSTS: ForumPostListItem[] = [];
type SortBy = "newest" | "oldest" | "top";

export default function Forum() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [search, setSearch] = useState("");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading, isError } = usePosts({
    sortBy,
    page,
    pageSize: PAGE_SIZE,
  });
  const createPost = useCreatePost();
  const allPosts = data?.data ?? EMPTY_POSTS;
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Search and the "unanswered" filter are applied client-side to the
  // page of posts already fetched — the forum API has no search/filter
  // params yet, so this covers the current page rather than the whole
  // forum (a real backend change would be needed for global search).
  const posts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPosts.filter((post: ForumPostListItem) => {
      if (unansweredOnly && post.commentCount > 0) return false;
      if (!q) return true;
      return post.title.toLowerCase().includes(q) || post.body.toLowerCase().includes(q);
    });
  }, [allPosts, search, unansweredOnly]);

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
    <div className="mx-auto max-w-4xl px-[18px] py-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions, share discussion, and help each other out.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isCreating ? "Cancel" : "New post"}
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mt-6 flex flex-col gap-3 rounded-[22px] border border-[#ECEBF7] bg-white p-5 shadow-sm"
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
            className="self-start rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60"
          >
            {createPost.isPending ? "Posting…" : "Post"}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts on this page…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as SortBy);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="top">Most popular</option>
        </select>
        <button
          type="button"
          onClick={() => setUnansweredOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition motion-safe:duration-150 ${
            unansweredOnly
              ? "border-amber-400 bg-amber-50 text-amber-700"
              : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <CircleHelp className="h-4 w-4" aria-hidden="true" />
          Unanswered only
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ForumPostSkeleton key={i} />)
        ) : isError ? (
          <EmptyState
            icon={MessageSquare}
            title="Could not load posts"
            description="Something went wrong while fetching the forum. Please try again."
          />
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="group flex gap-4 rounded-2xl border border-[#ECEBF7] bg-white p-5 shadow-sm transition motion-safe:duration-150 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
            >
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <VoteButtons
                  targetType="forum_post"
                  targetId={post.id}
                  voteScore={post.voteScore}
                  myVote={post.myVote}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-800 group-hover:text-primary-700">
                    {post.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.commentCount > 0
                        ? "bg-primary-50 text-primary-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {post.commentCount > 0 ? "Answered" : "Unanswered"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.body}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
                  </span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon={MessageSquare}
            title={search || unansweredOnly ? "No matching posts" : "No posts yet"}
            description={
              search || unansweredOnly
                ? "Try a different search or clear the unanswered filter."
                : "Be the first to start a discussion in this forum."
            }
          />
        )}
      </div>

      {allPosts.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} result{total === 1 ? "" : "s"})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full bg-slate-100 px-4 py-1.5 font-medium text-slate-600 transition motion-safe:duration-150 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full bg-slate-100 px-4 py-1.5 font-medium text-slate-600 transition motion-safe:duration-150 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

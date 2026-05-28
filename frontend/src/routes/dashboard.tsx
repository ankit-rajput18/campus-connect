import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SlidersHorizontal, TrendingUp, Flame, Clock, LogIn, X, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";
import { categories, type Category, type PostStatus } from "@/lib/mock-data";

type SortOption = "recent" | "trending" | "hot";
import { getPosts, isAuthenticated } from "@/lib/api";

interface FeedPost {
  id: string;
  title: string;
  description: string;
  image: string;
  category: Category;
  status: PostStatus;
  avatar: string;
  student: string;
  college: string;
  postedAt: string;
  userRequestStatus?: "Pending" | "Accepted" | "Rejected" | null;
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Feed — Campus Connect" }] }),
  component: Dashboard,
});

const sortOptions: { value: SortOption; label: string; icon: LucideIcon }[] = [
  { value: "recent", label: "Recent", icon: Clock },
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "hot", label: "Hot", icon: Flame },
];



function GuestBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5 flex items-center gap-3 glass-card border border-indigo-100 rounded-[16px] px-4 py-3 shadow-card"
    >
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 shrink-0">
        <LogIn className="h-4 w-4 text-indigo-600" />
      </div>
      <p className="flex-1 text-sm text-foreground/80">
        You're browsing as a guest.{" "}
        <Link to="/auth" className="font-semibold text-indigo-600 hover:underline">
          Sign in
        </Link>{" "}
        to post, save items, and connect with students.
      </p>
      <button
        onClick={onDismiss}
        className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/60 transition shrink-0 text-muted-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

function Dashboard() {
  const location = useLocation();
  const initialSearch = new URLSearchParams(location.search).get("search") ?? "";
  const [isGuest, setIsGuest] = useState(() => !isAuthenticated());
  const [active, setActive] = useState<Category | "All">("All");
  const [query, setQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(8);
  const [sort, setSort] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    setIsGuest(!isAuthenticated());
  }, []);

  useEffect(() => {
    let activeRequest = true;

    async function loadPosts() {
      setLoading(true);
      setVisible(8);
      const response = await getPosts({
        category: active === "All" ? undefined : active,
        search: query.trim() || undefined,
        sort,
        limit: 36,
      });

      if (!activeRequest) return;

      if (!response.error && response.data?.posts) {
        const normalized = response.data.posts.map((post: any) => ({
          id: post._id,
          title: post.title,
          description: post.description,
          image:
            post.image ||
            "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1200&q=80",
          category: (post.category || "Others") as Category,
          status: (post.status || "Available") as PostStatus,
          avatar:
            post.author?.avatar ||
            `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(post.author?.name || post._id)}`,
          student: post.author?.name || "Student",
          college: post.author?.college || "",
          postedAt: new Date(post.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          userRequestStatus: post.userRequestStatus ?? null,
        }));
        setPosts(normalized);
      }
      setLoading(false);
    }

    loadPosts();

    return () => {
      activeRequest = false;
    };
  }, [active, query, sort]);

  const filtered = posts.filter(
    (p) =>
      (active === "All" || p.category === active) &&
      (query === "" ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.student.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AppShell>
      {/* ── Guest banner ── */}
      <AnimatePresence>
        {isGuest && !bannerDismissed && (
          <GuestBanner onDismiss={() => setBannerDismissed(true)} />
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Campus Feed</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Latest from DYP DPU · Pimpri, Pune
            </p>
          </div>
          {/* Sort (desktop) */}
          <div className="hidden md:flex items-center gap-1 glass-card rounded-[14px] p-1 border border-white/70 shadow-card">
            {sortOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-200 ${
                  sort === s.value
                    ? "gradient-bg text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full glass-card rounded-[14px] pl-10 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-white/70 shadow-card transition"
          />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg transition ${
              showFilters ? "gradient-bg text-white" : "bg-white/70 text-muted-foreground"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile sort */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex items-center gap-2 pb-1">
                <span className="text-xs font-semibold text-muted-foreground">Sort by:</span>
                {sortOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSort(s.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      sort === s.value
                        ? "gradient-bg text-white shadow-soft"
                        : "glass-card border border-white/70 text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-3 w-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Category pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-hide mb-6">
        {(["All", ...categories] as const).map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setActive(c as Category | "All"); setVisible(8); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 ${
              active === c
                ? "gradient-bg text-white shadow-soft"
                : "glass-card border border-white/70 text-foreground/70 hover:text-foreground shadow-card"
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>

      {/* ── Post grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`skel-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <PostCardSkeleton />
                </motion.div>
              ))
            : filtered.slice(0, visible).map((p, i) => (
                <PostCard key={p.id} post={p} index={i} isGuest={isGuest} />
              ))}
        </AnimatePresence>
      </div>

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 text-center"
        >
          <div className="grid h-20 w-20 mx-auto place-items-center rounded-[24px] bg-muted/60 mb-5">
            <Search className="h-9 w-9 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">No posts found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {query
              ? `No results for "${query}". Try a different search.`
              : "No posts in this category yet. Be the first to post!"}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-sm text-primary hover:underline font-medium"
              >
                Clear search
              </button>
            )}
            {isGuest ? (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 gradient-bg text-white text-sm font-semibold rounded-[14px] px-5 py-2.5 shadow-soft hover:shadow-glow transition"
              >
                <LogIn className="h-4 w-4" />
                Sign in to Post
              </Link>
            ) : (
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 gradient-bg text-white text-sm font-semibold rounded-[14px] px-5 py-2.5 shadow-soft hover:shadow-glow transition"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Load more ── */}
      {!loading && visible < filtered.length && (
        <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisible((v) => v + 8)}
            className="glass-card border border-white/70 rounded-[14px] px-8 py-3 text-sm font-semibold shadow-card hover:shadow-soft transition-all duration-200"
          >
            Load more posts
          </motion.button>
        </div>
      )}

      {/* ── FAB — guests see sign-in, logged-in see create ── */}
      {isGuest ? (
        <Link
          to="/auth"
          className="fixed bottom-24 right-5 z-30 md:hidden"
          aria-label="Sign in to post"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="grid h-14 w-14 place-items-center rounded-[18px] gradient-bg text-white shadow-glow"
          >
            <LogIn className="h-5 w-5" />
          </motion.div>
        </Link>
      ) : (
        <Link
          to="/create-post"
          className="fixed bottom-24 right-5 z-30 md:hidden"
          aria-label="Create post"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="grid h-14 w-14 place-items-center rounded-[18px] gradient-bg text-white shadow-glow"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </motion.div>
        </Link>
      )}
    </AppShell>
  );
}

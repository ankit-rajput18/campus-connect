import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  AlertTriangle,
  Plus,
  Package,
  Eye,
  Mail,
  User,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { categories } from "@/lib/mock-data";
import { toast } from "sonner";
import { deletePost, getMyPosts, getPostById, isAuthenticated, updatePost, respondToRequest } from "@/lib/api";

interface UserPost {
  id: string;
  title: string;
  description: string;
  category: string;
  listingType: string;
  status: string;
  image: string;
  postedAt: string;
  condition: string;
  contact: string;
  views: number;
  requests?: Array<{
    id: string;
    requester: { _id: string; name: string; avatar?: string; college?: string } | null;
    message?: string;
    status?: string;
    respondedAt?: string | null;
  }>;
}

export const Route = createFileRoute("/my-posts")({
  head: () => ({ meta: [{ title: "My Posts — Campus Connect" }] }),
  component: MyPosts,
});

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  Available: {
    label: "Available",
    color: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  Exchanged: {
    label: "Exchanged",
    color: "text-zinc-600 bg-zinc-100 border border-zinc-200",
    dot: "bg-zinc-400",
  },
  Pending: {
    label: "Pending",
    color: "text-amber-700 bg-amber-50 border border-amber-100",
    dot: "bg-amber-500",
  },
};

const listingTypes = [
  { value: "exchange", label: "Exchange" },
  { value: "sell", label: "Sell" },
  { value: "rent", label: "Rent" },
  { value: "donate", label: "Donate" },
];

const conditions = ["Like New", "Good", "Fair", "Used"];

function MyPosts() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [toDelete, setToDelete] = useState<UserPost | null>(null);
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Others");
  const [editListingType, setEditListingType] = useState("exchange");
  const [editCondition, setEditCondition] = useState("Good");
  const [editContact, setEditContact] = useState("");
  const [editStatus, setEditStatus] = useState("Available");
  const [editTab, setEditTab] = useState<"details" | "info">("details");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [viewingPost, setViewingPost] = useState<UserPost | null>(null);
  const [activeRequestsPost, setActiveRequestsPost] = useState<UserPost | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteLoading(true);

    const response = await deletePost(toDelete.id);
    if (response.error) {
      toast.error(response.error, { description: response.message });
      setDeleteLoading(false);
      return;
    }

    setPosts((p) => p.filter((x) => x.id !== toDelete.id));
    toast.success("Post deleted", {
      description: `"${toDelete.title}" has been removed.`,
    });
    setToDelete(null);
    setDeleteLoading(false);
  };

  const loadMyPosts = async () => {
    const response = await getMyPosts();
    if (!response.error && response.data?.posts) {
      const normalized = response.data.posts.map((post) => ({
        id: post._id,
        title: post.title,
        description: post.description,
        category: post.category || "Others",
        listingType: post.listingType || "exchange",
        status: post.status || "Available",
        condition: post.condition || "Good",
        contact: post.contact || "",
        views: post.views || 0,
        image:
          post.image ||
          "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1200&q=80",
        postedAt: new Date(post.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        requests: (post.requests || []).map((r) => ({
          id: r._id,
          requester: r.requester || null,
          message: r.message || "",
          status: r.status || "Pending",
          respondedAt: r.respondedAt || null,
        })),
      }));
      setPosts(normalized);
      return normalized;
    }
    return null;
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/auth";
      return;
    }

    loadMyPosts();
  }, []);

  const openEditPost = (post: UserPost) => {
    setViewingPost(null);
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditCategory(post.category);
    setEditListingType(post.listingType || "exchange");
    setEditCondition(post.condition);
    setEditContact(post.contact);
    setEditStatus(post.status);
    setEditTab("details");
    setEditImagePreview(post.image);
    setEditImageFile(null);
  };

  const closeEditModal = () => {
    setEditingPost(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const openViewPost = async (post: UserPost) => {
    setViewingPost(post);

    const response = await getPostById(post.id);
    if (!response.error && response.data?.post) {
      const fetched = response.data.post;
      setViewingPost({
        id: fetched._id,
        title: fetched.title,
        description: fetched.description,
        category: fetched.category || "Others",
        listingType: fetched.listingType || "exchange",
        status: fetched.status || "Available",
        condition: fetched.condition || "Good",
        contact: fetched.contact || "",
        views: fetched.views || 0,
        image:
          fetched.image ||
          "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1200&q=80",
        postedAt: new Date(fetched.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      });
      setPosts((prev) =>
        prev.map((item) =>
          item.id === fetched._id
            ? { ...item, views: fetched.views || item.views }
            : item
        )
      );
    }
  };

  const handleEditSubmit = async () => {
    if (!editingPost) return;
    if (!editTitle || !editDescription || !editCategory || !editContact) {
      toast.error("Please fill all required fields.");
      return;
    }

    setEditLoading(true);
    const response = await updatePost(editingPost.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      listingType: editListingType,
      condition: editCondition,
      contact: editContact,
      status: editStatus,
      image: editImageFile || undefined,
    });

    if (response.error) {
      toast.error(response.error, { description: response.message });
      setEditLoading(false);
      return;
    }

    if (response.data?.post) {
      const updated = response.data.post;
      setPosts((prev) =>
        prev.map((item) =>
          item.id === updated._id
            ? {
                ...item,
                title: updated.title,
                description: updated.description,
                category: updated.category || "Others",
                status: updated.status || item.status,
                condition: updated.condition || item.condition,
                contact: updated.contact || item.contact,
                image: updated.image || item.image,
              }
            : item
        )
      );
    }

    toast.success("Post updated successfully");
    closeEditModal();
    setEditLoading(false);
  };

  const stats = [
    { label: "Total", value: posts.length, color: "text-indigo-600 bg-indigo-50" },
    {
      label: "Available",
      value: posts.filter((p) => p.status === "Available").length,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pending",
      value: posts.filter((p) => p.status === "Pending").length,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Exchanged",
      value: posts.filter((p) => p.status === "Exchanged").length,
      color: "text-zinc-600 bg-zinc-100",
    },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {posts.length} active listing{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="glass-card border border-white/70 rounded-[12px] p-1 flex shadow-card">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`grid h-8 w-8 place-items-center rounded-[8px] transition-all duration-200 ${
                  view === v
                    ? "gradient-bg text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={v === "grid" ? "Grid view" : "List view"}
              >
                {v === "grid" ? (
                  <LayoutGrid className="h-3.5 w-3.5" />
                ) : (
                  <List className="h-3.5 w-3.5" />
                )}
              </button>
            ))}
          </div>
          {/* New post */}
          <Link
            to="/create-post"
            className="hidden sm:inline-flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold rounded-[12px] px-3.5 py-2 shadow-soft hover:shadow-glow transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-card border border-white/70 rounded-[16px] p-3 text-center shadow-card"
          >
            <div className={`text-xl font-display font-bold ${s.color.split(" ")[0]}`}>
              {s.value}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 text-center"
        >
          <div className="grid h-20 w-20 mx-auto place-items-center rounded-[24px] bg-muted/60 mb-5">
            <Package className="h-9 w-9 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">No posts yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first listing to start exchanging with campus peers.
          </p>
          <Link
            to="/create-post"
            className="inline-flex items-center gap-2 gradient-bg text-white font-semibold rounded-[14px] px-6 py-3 shadow-soft hover:shadow-glow transition"
          >
            <Plus className="h-4 w-4" />
            Create First Post
          </Link>
        </motion.div>
      ) : view === "grid" ? (
        /* Grid view */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {posts.map((p, i) => {
              const status = statusConfig[p.status];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card border border-white/70 rounded-[22px] overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {/* Status badge */}
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${status.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display font-bold text-sm line-clamp-1">{p.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                    {p.requests && p.requests.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground bg-indigo-50/20 p-2 rounded-[12px] border border-indigo-50">
                        <span className="font-semibold text-indigo-950">Requests:</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-100/50 text-indigo-900 font-medium">
                          {p.requests.length} total
                        </span>
                        {p.requests.filter((r) => r.status === "Accepted").length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                            {p.requests.filter((r) => r.status === "Accepted").length} accepted
                          </span>
                        )}
                        {p.requests.filter((r) => r.status === "Pending").length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                            {p.requests.filter((r) => r.status === "Pending").length} pending
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEditPost(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/70 hover:bg-white rounded-[10px] py-2 text-xs font-semibold transition border border-white/60"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => openViewPost(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/70 hover:bg-white rounded-[10px] py-2 text-xs font-semibold transition border border-white/60"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      {p.requests && p.requests.length > 0 && (
                        <button
                          onClick={() => setActiveRequestsPost(p)}
                          className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-[10px] px-3 py-2 text-xs font-semibold transition border border-indigo-100"
                        >
                          Requests · {p.requests.length}
                        </button>
                      )}
                      <button
                        onClick={() => setToDelete(p)}
                        className="grid h-8 w-8 place-items-center bg-red-50 hover:bg-red-100 text-destructive rounded-[10px] transition border border-red-100"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* List view */
        <div className="space-y-3">
          <AnimatePresence>
            {posts.map((p, i) => {
              const status = statusConfig[p.status];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card border border-white/70 rounded-[18px] p-4 flex items-center gap-4 shadow-card hover:shadow-soft transition-all duration-300"
                >
                  <img
                    src={p.image}
                    className="h-16 w-16 rounded-[12px] object-cover shrink-0"
                    alt={p.title}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{p.title}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {p.description}
                    </div>
                    {p.requests && p.requests.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-slate-800">Requests:</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 font-medium">
                          {p.requests.length} total
                        </span>
                        {p.requests.filter((r) => r.status === "Accepted").length > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-medium">
                            {p.requests.filter((r) => r.status === "Accepted").length} accepted
                          </span>
                        )}
                        {p.requests.filter((r) => r.status === "Pending").length > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-medium">
                            {p.requests.filter((r) => r.status === "Pending").length} pending
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">{p.postedAt}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.requests && p.requests.length > 0 && (
                      <button
                        onClick={() => setActiveRequestsPost(p)}
                        className="inline-flex h-9 items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 rounded-[10px] transition border border-indigo-100"
                      >
                        Requests · {p.requests.length}
                      </button>
                    )}
                    <button
                      onClick={() => openViewPost(p)}
                      className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/70 hover:bg-white transition border border-white/60"
                      aria-label="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openEditPost(p)}
                      className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/70 hover:bg-white transition border border-white/60"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setToDelete(p)}
                      className="grid h-9 w-9 place-items-center rounded-[10px] bg-red-50 hover:bg-red-100 text-destructive transition border border-red-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {toDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass-card border border-white/70 rounded-[28px] p-7 shadow-float text-center"
            >
              <div className="grid h-14 w-14 mx-auto place-items-center rounded-[18px] bg-red-50 text-destructive mb-4">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">Delete this post?</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                "{toDelete.title}" will be permanently removed from your listings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setToDelete(null)}
                  className="flex-1 bg-white/80 hover:bg-white rounded-[14px] py-3 font-semibold text-sm transition border border-white/60"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-destructive text-destructive-foreground rounded-[14px] py-3 font-semibold text-sm hover:opacity-90 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setViewingPost(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-card border border-white/70 rounded-[28px] overflow-hidden shadow-float"
            >
              <div className="relative">
                <img
                  src={viewingPost.image}
                  alt={viewingPost.title}
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={() => setViewingPost(null)}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                  aria-label="Close preview"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{viewingPost.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {viewingPost.category} · {viewingPost.listingType}
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {viewingPost.views} views
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{viewingPost.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-white/70 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">Condition</div>
                    <div className="font-semibold">{viewingPost.condition}</div>
                  </div>
                  <div className="rounded-[20px] border border-white/70 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">Contact</div>
                    <div className="font-semibold">{viewingPost.contact}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openEditPost(viewingPost)}
                    className="inline-flex items-center justify-center rounded-[14px] bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Edit listing
                  </button>
                  <button
                    onClick={() => setViewingPost(null)}
                    className="inline-flex items-center justify-center rounded-[14px] border border-white/70 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeRequestsPost && (() => {
          const reqs = activeRequestsPost.requests || [];
          const total = reqs.length;
          const accepted = reqs.filter((r) => r.status === "Accepted").length;
          const pending = reqs.filter((r) => r.status === "Pending").length;

          const getInitials = (name: string) => {
            return name
              ? name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setActiveRequestsPost(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 16, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg glass-card border border-white/70 rounded-[28px] overflow-hidden shadow-float"
              >
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-display text-xl font-bold">Interest Requests</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        for: <span className="font-semibold text-slate-800">{activeRequestsPost.title}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveRequestsPost(null)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white/80 border border-white/60 text-slate-900 hover:bg-white shadow-sm transition"
                      aria-label="Close modal"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2.5 my-4">
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-[14px] p-2 text-center">
                      <div className="text-lg font-bold text-indigo-900 font-display">{total}</div>
                      <div className="text-[10px] text-indigo-700/80 font-semibold tracking-wide uppercase">Total</div>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-[14px] p-2 text-center">
                      <div className="text-lg font-bold text-emerald-900 font-display">{accepted}</div>
                      <div className="text-[10px] text-emerald-700/80 font-semibold tracking-wide uppercase">Accepted</div>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-100 rounded-[14px] p-2 text-center">
                      <div className="text-lg font-bold text-amber-900 font-display">{pending}</div>
                      <div className="text-[10px] text-amber-700/80 font-semibold tracking-wide uppercase">Pending</div>
                    </div>
                  </div>

                  {/* Requests list container */}
                  <div className="mt-4 space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                    {reqs.map((r) => {
                      const initials = getInitials(r.requester?.name || "");
                      const isPending = r.status === "Pending";
                      const isAccepted = r.status === "Accepted";
                      const isRejected = r.status === "Rejected";

                      return (
                        <div
                          key={r.id}
                          className="border border-white/70 bg-white/40 p-4 rounded-[20px] shadow-sm flex flex-col gap-3"
                        >
                          {/* Profile Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={r.requester?.name || "Unknown"}
                                avatar={r.requester?.avatar || ""}
                                size="sm"
                                className="h-10 w-10 border border-white shadow-sm"
                              />
                              <div>
                                <h4 className="font-semibold text-sm text-slate-900">
                                  {r.requester?.name || "Unknown Student"}
                                </h4>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span>{r.requester?.college || "DYP DPU Student"}</span>
                                </div>
                                {isAccepted && r.requester?.email && (
                                  <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1 mt-1 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50 w-fit">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span>{r.requester.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                                isAccepted
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                                  : isPending
                                  ? "text-amber-700 bg-amber-50 border-amber-100"
                                  : "text-rose-700 bg-rose-50 border-rose-100"
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>

                          {/* Requester Message */}
                          {r.message && (
                            <div className="bg-slate-50/70 border border-slate-100 rounded-[14px] p-3 text-xs text-slate-700 italic flex items-start gap-2">
                              <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">"{r.message}"</span>
                            </div>
                          )}

                          {/* Respond Actions */}
                          {isPending && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={async () => {
                                  const res = await respondToRequest(activeRequestsPost.id, r.id, "accept");
                                  if (res.error) return toast.error(res.error);
                                  toast.success("Request accepted");
                                  const refreshed = await loadMyPosts();
                                  if (refreshed) {
                                    const updatedPost = refreshed.find((x) => x.id === activeRequestsPost.id) || null;
                                    setActiveRequestsPost(updatedPost);
                                  }
                                }}
                                className="flex-1 py-2 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow-soft transition-all"
                              >
                                Accept
                              </button>
                              <button
                                onClick={async () => {
                                  const res = await respondToRequest(activeRequestsPost.id, r.id, "reject");
                                  if (res.error) return toast.error(res.error);
                                  toast.success("Request rejected");
                                  const refreshed = await loadMyPosts();
                                  if (refreshed) {
                                    const updatedPost = refreshed.find((x) => x.id === activeRequestsPost.id) || null;
                                    setActiveRequestsPost(updatedPost);
                                  }
                                }}
                                className="py-2 px-4 rounded-[12px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-semibold text-xs transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {reqs.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No interest requests yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl glass-card border border-white/70 rounded-[28px] overflow-hidden shadow-float"
            >
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold">Edit post</h3>
                    <p className="text-sm text-muted-foreground">Update your listing quickly with tabbed settings.</p>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-slate-900 hover:bg-white transition"
                    aria-label="Close edit form"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-white/70 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setEditTab("details")}
                    className={`rounded-[14px] px-3 py-2 text-sm font-semibold transition ${
                      editTab === "details"
                        ? "bg-white text-slate-900 shadow-soft"
                        : "text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab("info")}
                    className={`rounded-[14px] px-3 py-2 text-sm font-semibold transition ${
                      editTab === "info"
                        ? "bg-white text-slate-900 shadow-soft"
                        : "text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    Info
                  </button>
                </div>

                {editTab === "details" ? (
                  <div className="grid gap-4">
                    <label className="block text-sm font-semibold text-slate-900">Title</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="field-input w-full"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="field-input w-full"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900">Type</label>
                        <select
                          value={editListingType}
                          onChange={(e) => setEditListingType(e.target.value)}
                          className="field-input w-full"
                        >
                          {listingTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900">Condition</label>
                        <select
                          value={editCondition}
                          onChange={(e) => setEditCondition(e.target.value)}
                          className="field-input w-full"
                        >
                          {conditions.map((condition) => (
                            <option key={condition} value={condition}>{condition}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="field-input w-full"
                        >
                          {Object.keys(statusConfig).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Contact</label>
                      <input
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="field-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="field-input min-h-[120px] w-full resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={closeEditModal}
                    className="rounded-[14px] border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={editLoading}
                    className="rounded-[14px] bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editLoading ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

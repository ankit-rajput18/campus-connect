import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Compass,
  Plus,
  User,
  FileText,
  LogOut,
  Search,
  Bell,
  X,
  ChevronDown,
  MessageSquare,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { getMe, handleLogout, isAuthenticated, getNotifications, respondToRequest, getCachedUser, setCachedUser, notifyUserUpdated } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import type { Notification } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Feed" },
  { to: "/colleges", icon: Compass, label: "Explore" },
  { to: "/chat", icon: MessageSquare, label: "Messages" },
  { to: "/create-post", icon: Plus, label: "Post" },
  { to: "/my-posts", icon: FileText, label: "My Posts" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(() => getCachedUser());
  const isGuest = !isAuthenticated();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const loc = useLocation();
  const navigate = useNavigate();

  // ── PWA install prompt — handled globally in __root.tsx ───────────────────

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const fetchUser = async () => {
      const response = await getMe();
      if (response.data?.user) {
        setUser(response.data.user);
        setCachedUser(response.data.user);
      }
    };

    // Ensure realtime socket is connected for authenticated users
    connectSocket();
    fetchUser();

    // Listen for profile updates fired from the profile page
    const onUserUpdated = (e: Event) => {
      const updated = (e as CustomEvent).detail;
      if (updated) {
        setUser(updated);
        setCachedUser(updated);
      }
    };
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated()) return;
    const res = await getNotifications();
    if (res.data) {
      setNotifications(res.data.notifications ?? []);
      setPendingCount(res.data.pendingCount ?? 0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new requests
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleRespond = async (postId: string, requestId: string, action: "accept" | "reject") => {
    setRespondingId(requestId);
    const res = await respondToRequest(postId, requestId, action);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(action === "accept" ? "Request accepted!" : "Request declined");
      await fetchNotifications();
    }
    setRespondingId(null);
  };

  // Close menu on route change
  useEffect(() => { setMenu(false); }, [loc.pathname]);

  // Derived avatar — use Cloudinary URL if set, else generate initials avatar
  const avatarSrc = user?.avatar && user.avatar.trim() !== ""
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=0078FF&color=fff&rounded=true`;

  return (
    <div className="min-h-screen pb-28 md:pb-12">
      {/* ── Top header ── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "px-3 pt-2" : "px-4 pt-4"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl glass rounded-2xl flex items-center gap-3 shadow-soft transition-all duration-300 ${
            scrolled ? "px-3 py-2" : "px-4 py-2.5"
          }`}
        >
          <Logo to="/dashboard" />

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search books, notes, electronics…"
              className="w-full bg-white/60 dark:bg-white/5 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-white/50 dark:border-white/10 transition placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {navItems.filter((n) => n.to !== "/create-post").map((n) => {
              const active = loc.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "gradient-bg text-white shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }`}
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell — only for authenticated users */}
            {!isGuest && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/60 dark:bg-white/8 hover:bg-white dark:hover:bg-white/12 transition border border-white/50 dark:border-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-foreground/70" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-500 ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.94 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 glass-strong rounded-2xl shadow-glow border border-white/50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/30">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-violet-500" />
                          <span className="text-sm font-semibold">Interest Requests</span>
                          {pendingCount > 0 && (
                            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                              {pendingCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="grid h-6 w-6 place-items-center rounded-lg hover:bg-white/60 transition"
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>

                      {/* Notification list */}
                      <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="h-12 w-12 rounded-2xl bg-violet-50 grid place-items-center mb-3">
                              <Bell className="h-5 w-5 text-violet-300" />
                            </div>
                            <p className="text-sm font-medium text-foreground/70">No requests yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              When someone shows interest in your posts, it'll appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-1.5">
                            {notifications.map((notif) => (
                              <div
                                key={notif.requestId}
                                className={`rounded-xl p-3 transition-all ${
                                  notif.status === "Pending"
                                    ? "bg-violet-50/80 border border-violet-100"
                                    : "bg-white/40 border border-white/30"
                                }`}
                              >
                                {/* Requester info */}
                                <div className="flex items-start gap-2.5">
                                  <img
                                    src={notif.requester?.avatar || "https://i.pravatar.cc/100?img=10"}
                                    alt={notif.requester?.name}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-semibold truncate">
                                        {notif.requester?.name || "Someone"}
                                      </span>
                                      {notif.status === "Pending" && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">
                                          <Clock className="h-2.5 w-2.5" />
                                          Pending
                                        </span>
                                      )}
                                      {notif.status === "Accepted" && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">
                                          <CheckCircle className="h-2.5 w-2.5" />
                                          Accepted
                                        </span>
                                      )}
                                      {notif.status === "Rejected" && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full shrink-0">
                                          <XCircle className="h-2.5 w-2.5" />
                                          Declined
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      Interested in{" "}
                                      <span className="font-medium text-foreground/80">
                                        {notif.postTitle}
                                      </span>
                                    </p>
                                    {notif.message && (
                                      <p className="text-[10px] text-muted-foreground mt-1 italic line-clamp-2">
                                        "{notif.message}"
                                      </p>
                                    )}
                                  </div>
                                  {/* Post thumbnail */}
                                  {notif.postImage && (
                                    <img
                                      src={notif.postImage}
                                      alt={notif.postTitle}
                                      className="h-10 w-10 rounded-lg object-cover shrink-0 border border-white/60"
                                    />
                                  )}
                                  {!notif.postImage && (
                                    <div className="h-10 w-10 rounded-lg bg-violet-50 grid place-items-center shrink-0 border border-violet-100">
                                      <Package className="h-4 w-4 text-violet-300" />
                                    </div>
                                  )}
                                </div>

                                {/* Action buttons — only for pending */}
                                {notif.status === "Pending" && (
                                  <div className="flex gap-1.5 mt-2.5">
                                    <button
                                      onClick={() => handleRespond(notif.postId, notif.requestId, "accept")}
                                      disabled={respondingId === notif.requestId}
                                      className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition disabled:opacity-60"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      {respondingId === notif.requestId ? "..." : "Accept"}
                                    </button>
                                    <button
                                      onClick={() => handleRespond(notif.postId, notif.requestId, "reject")}
                                      disabled={respondingId === notif.requestId}
                                      className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-500 border border-red-100 transition disabled:opacity-60"
                                    >
                                      <XCircle className="h-3 w-3" />
                                      {respondingId === notif.requestId ? "..." : "Decline"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="border-t border-white/30 px-4 py-2.5">
                          <Link
                            to="/my-posts"
                            onClick={() => setNotifOpen(false)}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
                          >
                            View all in My Posts →
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* Desktop Post button */}
            {isGuest ? (
              <Link
                to="/auth"
                className="hidden md:inline-flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold rounded-xl px-3.5 py-2 shadow-soft hover:shadow-glow transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in to Post
              </Link>
            ) : (
              <Link
                to="/create-post"
                className="hidden md:inline-flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold rounded-xl px-3.5 py-2 shadow-soft hover:shadow-glow transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Post
              </Link>
            )}

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-white/8 hover:bg-white dark:hover:bg-white/12 px-2 py-1.5 transition border border-white/50 dark:border-white/10"
              >
                <img
                  src={avatarSrc}
                  className="h-7 w-7 rounded-lg object-cover"
                  alt="avatar"
                />
                <span className="hidden sm:block text-sm font-semibold pr-0.5">
                  {user?.name ? user.name.split(" ")[0] : "You"}
                </span>
                <ChevronDown
                  className={`hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${menu ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {menu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.94 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 glass-strong rounded-2xl p-1.5 shadow-glow border border-white/50"
                    >
                      {/* User info */}
                      <div className="px-3 py-2.5 mb-1">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatarSrc}
                            className="h-9 w-9 rounded-xl object-cover"
                            alt="avatar"
                          />
                          <div>
                            <div className="text-sm font-semibold">{user?.name || "Campus Student"}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {user?.college || user?.department || "DYP DPU · Pimpri, Pune"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-border/60 mx-1 mb-1" />
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/60 text-sm font-medium transition"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-posts"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/60 text-sm font-medium transition"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        My Posts
                      </Link>
                      <div className="h-px bg-border/60 mx-1 my-1" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenu(false);
                          navigate({ to: "/auth" });
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-sm font-medium text-destructive transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-7xl px-4 mt-6">
        <motion.div
          key={loc.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="glass-strong rounded-[22px] shadow-glow border border-white/60 px-2 py-2 flex items-center justify-around bottom-nav-safe">
          {navItems.map((n) => {
            const active = loc.pathname === n.to;
            const isCreate = n.to === "/create-post";

            if (isCreate) {
              return isGuest ? (
                // Guest: show Sign In button instead of Create Post
                <Link
                  key={n.to}
                  to="/auth"
                  className="flex flex-col items-center"
                  aria-label="Sign in to post"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="grid h-12 w-12 place-items-center rounded-[16px] gradient-bg text-white shadow-glow"
                  >
                    <LogIn className="h-5 w-5" />
                  </motion.div>
                </Link>
              ) : (
                // Authenticated: show Create Post
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex flex-col items-center"
                  aria-label="Create post"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="grid h-12 w-12 place-items-center rounded-[16px] gradient-bg text-white shadow-glow"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[52px]"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`grid h-9 w-9 place-items-center rounded-[12px] transition-all duration-200 ${
                    active
                      ? "gradient-bg text-white shadow-soft"
                      : "text-muted-foreground"
                  }`}
                >
                  <n.icon className="h-[18px] w-[18px]" />
                </motion.div>
                <span
                  className={`text-[9px] font-semibold tracking-wide transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

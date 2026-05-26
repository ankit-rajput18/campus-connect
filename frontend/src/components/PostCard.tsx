import { motion } from "framer-motion";
import { Bookmark, Heart, MapPin, Clock, Send, Lock } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Post } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { sendInterest } from "@/lib/api";

const categoryConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Books: {
    color: "text-blue-700",
    bg: "bg-blue-50 border border-blue-100",
    dot: "bg-blue-500",
  },
  Notes: {
    color: "text-violet-700",
    bg: "bg-violet-50 border border-violet-100",
    dot: "bg-violet-500",
  },
  Electronics: {
    color: "text-cyan-700",
    bg: "bg-cyan-50 border border-cyan-100",
    dot: "bg-cyan-500",
  },
  "Hostel Essentials": {
    color: "text-pink-700",
    bg: "bg-pink-50 border border-pink-100",
    dot: "bg-pink-500",
  },
  Others: {
    color: "text-amber-700",
    bg: "bg-amber-50 border border-amber-100",
    dot: "bg-amber-500",
  },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  Available: { label: "Available", color: "text-emerald-700 bg-emerald-50 border border-emerald-100" },
  Exchanged: { label: "Exchanged", color: "text-zinc-600 bg-zinc-100 border border-zinc-200" },
  Pending: { label: "Pending", color: "text-amber-700 bg-amber-50 border border-amber-100" },
};

export function PostCard({ post, index = 0, isGuest = false }: { post: Post; index?: number; isGuest?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);
  const cat = categoryConfig[post.category] ?? categoryConfig["Others"];
  const status = statusConfig[post.status];
  const navigate = useNavigate();

  const requireAuth = (action: string) => {
    toast.error(`Sign in to ${action}`, {
      description: "Create a free account to connect with campus students.",
      action: {
        label: "Sign in",
        onClick: () => navigate({ to: "/auth" }),
      },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="group glass-card rounded-[22px] overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${cat.bg} ${cat.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
            {post.category}
          </span>
        </div>

        {/* Status badge */}
        {post.status !== "Available" && (
          <div className="absolute top-3 right-12">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        )}

        {/* Bookmark */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => {
            if (isGuest) { requireAuth("save items"); return; }
            setSaved((s) => !s);
            toast.success(saved ? "Removed from saved" : "Saved to collection");
          }}
          className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Bookmark
            className={`h-3.5 w-3.5 transition-colors ${
              saved ? "fill-primary text-primary" : "text-foreground/60"
            }`}
          />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[15px] leading-snug line-clamp-1 text-foreground">
          {post.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Student info */}
        <div className="mt-3 flex items-center gap-2">
          <img
            src={post.avatar}
            alt={post.student}
            className="h-7 w-7 rounded-full ring-2 ring-white shadow-sm object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{post.student}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{post.college}</span>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
            <Clock className="h-2.5 w-2.5" />
            {post.postedAt}
          </div>
        </div>

        {/* CTA */}
        {isGuest ? (
          <div className="mt-4 flex gap-2 w-full">
            {/* I'm Interested — blocked for guests */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => requireAuth("show interest")}
              className="flex-[1.2] inline-flex items-center justify-center gap-1.5 font-semibold rounded-[14px] py-2.5 text-xs bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
            >
              <Lock className="h-3 w-3" />
              I'm Interested
            </motion.button>

            {/* Chat — blocked for guests */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => requireAuth("chat")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 font-semibold rounded-[14px] py-2.5 text-xs bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
            >
              <Lock className="h-3 w-3" />
              Chat
            </motion.button>
          </div>
        ) : (
          <div className="mt-4 flex gap-2 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                  if (interested) return;
                  const res = await sendInterest(post.id);
                  if (res.error) return toast.error(res.error || "Could not send interest");
                  setInterested(true);
                  toast.success(`Interest sent to ${post.student}!`, {
                    description: "They'll be notified on their campus feed.",
                  });
                }}
              disabled={interested}
              className={`flex-[1.2] inline-flex items-center justify-center gap-1.5 font-semibold rounded-[14px] py-2.5 text-xs transition-all duration-200 ${
                interested
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default"
                  : "gradient-bg text-white shadow-soft hover:shadow-glow"
              }`}
            >
              {interested ? (
                <>✓ Interest Sent</>
              ) : (
                <>
                  <Heart className="h-3 w-3" />
                  I'm Interested
                </>
              )}
            </motion.button>

            <Link
              to="/chat"
              search={{
                userId: post.student.toLowerCase().replace(/\s+/g, "-"),
                name: post.student,
                avatar: post.avatar,
              } as any}
              className="flex-1 inline-flex items-center justify-center gap-1.5 font-semibold rounded-[14px] py-2.5 text-xs border border-white/60 bg-white/70 hover:bg-white text-foreground shadow-card hover:shadow-soft transition-all duration-200"
            >
              <Send className="h-3 w-3 text-primary" />
              Chat
            </Link>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="glass-card rounded-[22px] overflow-hidden shadow-card">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg shimmer" />
        <div className="h-3 w-full rounded-lg shimmer" />
        <div className="h-3 w-2/3 rounded-lg shimmer" />
        <div className="flex items-center gap-2 mt-2">
          <div className="h-7 w-7 rounded-full shimmer" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-24 rounded shimmer" />
            <div className="h-2 w-16 rounded shimmer" />
          </div>
        </div>
        <div className="h-10 w-full rounded-[14px] shimmer mt-1" />
      </div>
    </div>
  );
}

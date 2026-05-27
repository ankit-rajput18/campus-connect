import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Calendar,
  Pencil,
  Award,
  Package,
  Shuffle,
  Check,
  Camera,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState, ChangeEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getMyProfile, updateProfile } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Campus Connect" }] }),
  component: ProfilePage,
});

const statusColors: Record<string, string> = {
  Available: "text-emerald-700 bg-emerald-50 border border-emerald-100",
  Exchanged: "text-zinc-600 bg-zinc-100 border border-zinc-200",
  Pending: "text-amber-700 bg-amber-50 border border-amber-100",
};

function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    year: "",
    branch: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await getMyProfile();
      if (response.error) {
        toast.error(response.error);
      }
      if (response.data?.user) {
        setProfile(response.data.user);
        setAvatarPreview(response.data.user.avatar || "");
        setForm({
          name: response.data.user.name || "",
          bio: response.data.user.bio || "",
          year: response.data.user.year || "",
          branch: response.data.user.branch || "",
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const response = await updateProfile({
      name: form.name,
      bio: form.bio,
      year: form.year,
      branch: form.branch,
      avatar: avatarFile || undefined,
    });
    setSaving(false);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    if (response.data?.user) {
      setProfile(response.data.user);
      setAvatarPreview(response.data.user.avatar || "");
      setAvatarFile(null);
      setForm({
        name: response.data.user.name || "",
        bio: response.data.user.bio || "",
        year: response.data.user.year || "",
        branch: response.data.user.branch || "",
      });
      toast.success("Profile updated!", {
        description: "Your changes have been saved.",
      });
      setActiveTab("overview");
    }
  };

  const openAvatarPicker = () => {
    setActiveTab("edit");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto py-20 text-center text-muted-foreground">
          Loading profile...
        </div>
      </AppShell>
    );
  }

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  const karmaValue =
    profile?.totalPosts && profile.totalPosts > 0
      ? Math.min(
          5,
          Math.round(
            ((3 + (profile.totalExchanges || 0) / Math.max(1, profile.totalPosts) * 2) || 0) * 10,
          ) / 10,
        )
      : 0;
  const karmaLabel = typeof karmaValue === "number" ? karmaValue.toFixed(1) : String(karmaValue);
  const recentPosts = profile?.recentPosts ?? [];
  const hotStreakActive = recentPosts.filter((post) => {
    const date = new Date(post.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length >= 2;
  const isSenior = /final|third|fourth|last/i.test(profile?.year || "");

  const achievements = [
    {
      emoji: "🏆",
      label: "Top Trader",
      earned: profile?.totalExchanges >= 3,
      description: "Earned by completing multiple exchanges.",
    },
    {
      emoji: "📚",
      label: "Book Worm",
      earned: profile?.bookPosts >= 1,
      description: "Posting book listings earns this badge.",
    },
    {
      emoji: "⭐",
      label: "5-Star",
      earned: karmaValue >= 4.5,
      description: "High karma from active campus trading.",
    },
    {
      emoji: "🔥",
      label: "Hot Streak",
      earned: hotStreakActive,
      description: "Two or more posts in the last 7 days.",
    },
    {
      emoji: "🤝",
      label: "Connector",
      earned: profile?.totalExchanges > 0,
      description: "Completed at least one exchange.",
    },
    {
      emoji: "🎓",
      label: "Senior",
      earned: isSenior,
      description: "Matched to a later year in college.",
    },
  ];

  const stats = [
    {
      label: "Posts",
      value: profile?.totalPosts ?? 0,
      icon: Package,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Exchanges",
      value: profile?.totalExchanges ?? 0,
      icon: Shuffle,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Karma",
      value: karmaLabel,
      icon: Star,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Views",
      value: profile?.totalViews ?? 0,
      icon: TrendingUp,
      color: "text-sky-600 bg-sky-50",
    },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card border border-white/70 rounded-[28px] overflow-hidden shadow-float"
        >
          {/* Banner */}
          <div className="relative h-28 md:h-36 gradient-bg">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.1),transparent_60%)]" />
            {/* Edit banner button */}
            <button
              type="button"
              onClick={openAvatarPicker}
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-14">
              {/* Avatar */}
              <div className="relative shrink-0">
                <UserAvatar
                  name={form.name || profile?.name || "Campus Student"}
                  avatar={avatarPreview || profile?.avatar || ""}
                  size="3xl"
                  className="ring-4 ring-white shadow-glow"
                />
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-xl gradient-bg text-white shadow-soft"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                {activeTab === "edit" ? (
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="field-input font-display text-xl font-bold mb-2"
                    placeholder={profile?.name || "Campus Student"}
                  />
                ) : (
                  <h1 className="font-display text-xl md:text-2xl font-bold">{profile?.name || "Campus Student"}</h1>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {profile?.email || "Not available"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile?.college || profile?.department || "DYP DPU · Pimpri, Pune"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {joinedDate || "soon"}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {profile?.year || "Year not set"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                    {profile?.branch || "Branch not set"}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("edit")}
                className="shrink-0 inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold glass border border-white/60 hover:shadow-soft transition"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </motion.button>
            </div>

            <div className="mt-5">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "edit")}> 
                <TabsList className="gap-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-4 mt-5">

                    {/* ── Profile details — iOS Settings style ── */}
                    <div className="rounded-[20px] border border-white/70 bg-white/30 overflow-hidden">

                      {/* Email */}
                      <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/40 active:bg-white/50 transition border-b border-white/40 text-left"
                      >
                        <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center shrink-0">
                          <Mail className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</div>
                          <div className="text-sm font-medium text-foreground truncate mt-0.5">
                            {profile?.email || "Not set"}
                          </div>
                        </div>
                      </button>

                      {/* College */}
                      <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/40 active:bg-white/50 transition border-b border-white/40 text-left"
                      >
                        <div className="h-8 w-8 rounded-xl bg-violet-50 border border-violet-100 grid place-items-center shrink-0">
                          <MapPin className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">College</div>
                          <div className="text-sm font-medium text-foreground leading-snug mt-0.5">
                            {profile?.college || "Not set"}
                          </div>
                        </div>
                      </button>

                      {/* Year + Branch side by side */}
                      <div className="grid grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab("edit")}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/40 active:bg-white/50 transition border-r border-white/40 text-left"
                        >
                          <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 grid place-items-center shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year</div>
                            <div className="text-sm font-medium text-foreground truncate mt-0.5">
                              {profile?.year || "Not set"}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("edit")}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/40 active:bg-white/50 transition text-left"
                        >
                          <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center shrink-0">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch</div>
                            <div className="text-sm font-medium text-foreground truncate mt-0.5">
                              {profile?.branch || "Not set"}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* ── Bio ── */}
                    <div className="rounded-[20px] border border-white/70 bg-white/30 px-4 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio</div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {profile?.bio || "No bio yet. Add a short introduction to help others connect."}
                      </p>
                    </div>

                  </div>
                </TabsContent>

                <TabsContent value="edit">
                  <div className="space-y-5 mt-5">
                    <div className="grid gap-4">
                      <label className="block text-sm font-semibold text-slate-900">Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="field-input w-full"
                        placeholder={profile?.name || "Campus Student"}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900">Year</label>
                        <input
                          value={form.year}
                          onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                          className="field-input w-full"
                          placeholder={profile?.year || "e.g. Third Year"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900">Branch</label>
                        <input
                          value={form.branch}
                          onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
                          className="field-input w-full"
                          placeholder={profile?.branch || "e.g. Computer"}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <label className="block text-sm font-semibold text-slate-900">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="field-input w-full resize-none"
                        placeholder={profile?.bio || "Tell your campus about yourself…"}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="rounded-[14px] border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-[14px] bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card border border-white/70 rounded-[18px] p-4 text-center shadow-card"
            >
              <div
                className={`grid h-9 w-9 mx-auto place-items-center rounded-2xl mb-2 ${s.color}`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div className="font-display text-xl font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Recent activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card border border-white/70 rounded-[24px] p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Recent activity</h2>
            <span className="text-xs text-muted-foreground glass rounded-full px-3 py-1">
              {recentPosts.length} items
            </span>
          </div>

          <div className="space-y-3">
            {recentPosts.map((p, i) => (
              <motion.div
                key={`recent-${i}-${p.title}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-white/50 transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {p.status ? ` · ${p.status === "Available" ? "Active" : p.status}` : ""}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    statusColors[p.status]
                  }`}
                >
                  {p.status === "Available" ? "Active" : p.status}
                </span>
              </motion.div>
            ))}
            {recentPosts.length === 0 && (
              <div className="text-sm text-muted-foreground">You haven’t posted anything yet.</div>
            )}
          </div>
        </motion.div>

        {/* ── Achievements ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card border border-white/70 rounded-[24px] p-5 shadow-card"
        >
          <h2 className="font-display text-lg font-bold mb-4">Achievements</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Badges are unlocked from actual profile activity like posts, exchanges, and recent streaks.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-[14px] text-center border ${
                  a.earned
                    ? "bg-white/80 border-slate-200"
                    : "bg-white/10 border-white/40 opacity-70"
                }`}
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{a.label}</span>
                <span className="text-[9px] text-muted-foreground">{a.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import {
  BookOpen,
  NotebookPen,
  Users,
  LayoutGrid,
  ArrowRight,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Shuffle,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Search,
} from "lucide-react";
import { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-illustration.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Connect — Dr. D. Y. Patil Institute of Technology" },
      {
        name: "description",
        content:
          "Exchange books, notes & student essentials easily within Dr. D. Y. Patil Institute of Technology, Pimpri, Pune.",
      },
      { property: "og:title", content: "Campus Connect — DYP DPU Pune" },
      {
        property: "og:description",
        content: "The student exchange platform built for DYP DPU, Pimpri, Pune.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BookOpen,
    title: "Exchange Books",
    desc: "Pass textbooks to juniors and grab next sem's at half the price.",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    perks: ["Save up to 70%", "Verified condition", "Instant connect"],
  },
  {
    icon: NotebookPen,
    title: "Find Study Materials",
    desc: "Handwritten notes, PYQs and lab files curated by toppers.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    perks: ["Topper notes", "PYQ collections", "Lab files"],
  },
  {
    icon: Users,
    title: "Connect With Students",
    desc: "Verified campus profiles. Chat, swap, build your study circle.",
    color: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50",
    perks: ["Verified profiles", "Direct messaging", "Study groups"],
  },
  {
    icon: LayoutGrid,
    title: "Manage Listings",
    desc: "Track interest, edit listings and mark items as exchanged.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    perks: ["Real-time updates", "Interest tracking", "Easy editing"],
  },
];

const stats = [
  { value: "1,000+", label: "Active Students", icon: Users, color: "text-indigo-600" },
  { value: "500+", label: "Exchanges Done", icon: Shuffle, color: "text-violet-600" },
  { value: "5", label: "Categories", icon: LayoutGrid, color: "text-sky-600" },
  { value: "98%", label: "Happy Swappers", icon: TrendingUp, color: "text-emerald-600" },
];

const testimonials = [
  {
    name: "Sneha Joshi",
    role: "3rd Year CSE",
    avatar: "https://i.pravatar.cc/80?img=47",
    text: "Saved ₹2,400 on textbooks this semester. The exchange process was super smooth!",
    rating: 5,
  },
  {
    name: "Rohan Deshmukh",
    role: "2nd Year ECE",
    avatar: "https://i.pravatar.cc/80?img=33",
    text: "Found DSA notes from a topper within 10 minutes. This platform is a game changer.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "4th Year Mech",
    avatar: "https://i.pravatar.cc/80?img=44",
    text: "Sold my entire first-year kit before leaving hostel. Highly recommend to everyone!",
    rating: 5,
  },
];

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="px-4 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/80 shadow-soft mb-6"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Dr. D. Y. Patil Institute of Technology, Pimpri, Pune
              <Sparkles className="h-3 w-3 text-violet-500" />
            </motion.div>

            <h1 className="font-display text-4xl md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.06] tracking-tight">
              Exchange{" "}
              <span className="gradient-text">Books, Notes</span>
              <br />& Student Essentials
              <br />
              <span className="text-foreground/80">Easily</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              The community-first exchange platform for DYP DPU, Pimpri, Pune. Save money, reduce waste,
              and build your campus network — all in one place.
            </p>

            {/* Trust points */}
            <div className="mt-5 flex flex-wrap gap-3">
              {["Free to use", "Verified students only", "Instant connect"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-sm">
              <Link
                to="/auth"
                className="flex-1 inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold rounded-[16px] px-6 py-3.5 shadow-soft hover:shadow-glow transition-all duration-200 text-sm"
              >
                Join Your Campus
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 glass-strong border border-white/60 font-semibold rounded-[16px] px-6 py-3.5 shadow-card hover:shadow-soft transition-all duration-200 text-sm"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                Browse Listings
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[12, 33, 44, 47, 51].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/60?img=${i}`}
                    className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    alt=""
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">1,000+</span> students already swapping
              </div>
            </div>
          </motion.div>

          {/* Right — Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow bg */}
            <div className="absolute inset-4 -z-10 rounded-[3rem] gradient-soft-bg blur-3xl opacity-80" />

            {/* Main card */}
            <div className="relative glass-card rounded-[2.5rem] p-6 md:p-8 shadow-float border border-white/70">
              <img
                src={heroImg}
                alt="Students exchanging books"
                className="w-full animate-float-slow"
              />

              {/* Floating badge 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 -left-5 glass-strong rounded-2xl px-3 py-2.5 shadow-soft flex items-center gap-2.5 border border-white/70"
              >
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/15">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold">DSA Notes</div>
                  <div className="text-[10px] text-muted-foreground">+24 interested</div>
                </div>
              </motion.div>

              {/* Floating badge 2 */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 1.2, ease: "easeInOut" }}
                className="absolute bottom-8 -right-5 glass-strong rounded-2xl px-3 py-2.5 shadow-soft flex items-center gap-2.5 border border-white/70"
              >
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15">
                  <GraduationCap className="h-4 w-4 text-violet-600" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold">Verified Student</div>
                  <div className="text-[10px] text-muted-foreground">DYP DPU · Pimpri</div>
                </div>
              </motion.div>

              {/* Floating badge 3 */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
                className="absolute bottom-24 -left-5 glass-strong rounded-2xl px-3 py-2 shadow-soft flex items-center gap-2 border border-white/70"
              >
                <span className="text-base">🎉</span>
                <div className="text-xs font-bold text-emerald-700">Exchange done!</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 py-4">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.07}>
              <div className="glass-card rounded-[22px] p-5 md:p-6 text-center shadow-card hover:shadow-soft transition-all duration-300 border border-white/70">
                <div
                  className={`grid h-10 w-10 mx-auto place-items-center rounded-2xl bg-white shadow-sm mb-3 ${s.color}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold gradient-text">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-4 pt-24 pb-8">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">
              <Zap className="h-3.5 w-3.5" />
              Features
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Everything you need to swap,{" "}
              <span className="gradient-text">smartly</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-base">
              Built mobile-first for the way campus life actually happens.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                  className="glass-card rounded-[24px] p-6 shadow-card hover:shadow-glow transition-all duration-300 border border-white/70 h-full flex flex-col"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-[16px] bg-gradient-to-br ${f.color} text-white shadow-soft mb-4`}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {f.desc}
                  </p>
                  <ul className="space-y-1.5">
                    {f.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-foreground/70">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-4 pt-24">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">
              <Star className="h-3.5 w-3.5 fill-violet-600" />
              Student Reviews
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Loved by students across campus
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.08}>
                <div className="glass-card rounded-[22px] p-6 shadow-card border border-white/70 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                    "{t.text}"
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

     

      <Footer />
    </div>
  );
}

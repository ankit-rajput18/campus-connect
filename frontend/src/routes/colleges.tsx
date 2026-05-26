import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Users, ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { colleges } from "@/lib/mock-data";
import { Logo } from "@/components/Logo";
import { DypDpuLogo } from "@/components/DypDpuLogo";

export const Route = createFileRoute("/colleges")({
  head: () => ({ meta: [{ title: "Choose your college — Campus Connect" }] }),
  component: CollegesPage,
});

function CollegesPage() {
  const nav = useNavigate();
  const college = colleges[0]; // single college — DYP DPU

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 pb-16">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 h-[36rem] w-[36rem] rounded-full animate-blob"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            filter: "blur(56px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full animate-blob [animation-delay:-9s]"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
            filter: "blur(48px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-2xl w-full flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-12">
          <Logo />
        </div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Your campus is ready
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold">
            Welcome to your <span className="gradient-text">campus feed</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
            Tap below to enter the verified student marketplace for your institute.
          </p>
        </motion.div>

        {/* ── Single college card ── */}
        <motion.button
          onClick={() => nav({ to: "/dashboard" })}
          whileHover={{ y: -5, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full text-left rounded-[28px] overflow-hidden shadow-float relative group"
        >
          {/* Deep indigo gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca]" />
          {/* Light leaks */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.18),transparent_55%)]" />

          <div className="relative p-8 md:p-10 flex flex-col gap-7">
            {/* Top row: logo + badge */}
            <div className="flex items-start justify-between gap-4">
              {/* Logo on white pill */}
              <div className="bg-white rounded-[16px] px-5 py-3 shadow-soft inline-flex items-center justify-center">
                <DypDpuLogo size={40} />
              </div>

              {/* Verified badge */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 backdrop-blur-sm text-white rounded-full px-3 py-1.5 border border-white/20">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified Campus
              </span>
            </div>

            {/* College name */}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
                Dr. D. Y. Patil University
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                {college.name}
              </h2>
            </div>

            {/* Address + students */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-white/80">
              <span className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/60" />
                <span className="leading-snug">{college.address}</span>
              </span>
              <span className="hidden sm:block text-white/30">·</span>
              <span className="flex items-center gap-2 shrink-0">
                <Users className="h-4 w-4 text-white/60" />
                {college.students.toLocaleString()} students
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* CTA row */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {["Books", "Notes", "Electronics"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold bg-white/10 text-white/70 rounded-full px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold rounded-[14px] px-6 py-3 group-hover:scale-105 transition-transform duration-200 shadow-soft text-sm shrink-0">
                Enter Feed
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          Only verified students of DYP DPU can post and connect.{" "}
          <span className="text-primary font-medium cursor-pointer hover:underline">
            Learn more
          </span>
        </motion.p>
      </div>
    </div>
  );
}

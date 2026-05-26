import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 group select-none">
      {/* Icon mark */}
      <div className="relative grid h-9 w-9 place-items-center rounded-[11px] gradient-bg shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow group-hover:rotate-3 shrink-0">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
          <path d="M10 2L3 6.5V13.5L10 18L17 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
          <path d="M10 6L6.5 8V12L10 14L13.5 12V8L10 6Z" fill="white" fillOpacity="0.9" />
        </svg>
        {/* Glow dot */}
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-sky-400 border-2 border-white shadow-sm" />
      </div>

      {/* Wordmark */}
      <div className="leading-none">
        <div className="font-display text-[17px] font-bold tracking-tight">
          Campus<span className="gradient-text">Connect</span>
        </div>
        <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mt-0.5">
          DYP DPU · Pimpri, Pune
        </div>
      </div>
    </Link>
  );
}

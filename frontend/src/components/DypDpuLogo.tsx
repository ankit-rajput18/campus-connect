/**
 * DYP DPU — Dr. D. Y. Patil Institute of Technology logo
 * Recreated as inline SVG matching the official mark:
 *  - Crimson red serif wordmark "DYP DPU"
 *  - Gold decorative swoosh lines above each word
 *  - Gold horizontal rule with centre dot below
 */
export function DypDpuLogo({
  className = "",
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  // Keep aspect ratio 2.4 : 1  (logo is wider than tall)
  const w = size * 2.4;
  const h = size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 240 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DYP DPU logo"
    >
      {/* ── Gold swoosh above "DYP" ── */}
      <g stroke="#C9A84C" strokeWidth="2.2" fill="none" strokeLinecap="round">
        {/* bottom swoosh */}
        <path d="M18 34 Q38 22 58 30" />
        {/* top swoosh */}
        <path d="M22 28 Q40 17 56 24" />
        {/* sparkle dots */}
        <circle cx="18" cy="34" r="1.8" fill="#C9A84C" stroke="none" />
        <circle cx="58" cy="30" r="1.8" fill="#C9A84C" stroke="none" />
      </g>

      {/* ── Gold swoosh above "DPU" ── */}
      <g stroke="#C9A84C" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M138 34 Q158 22 178 30" />
        <path d="M142 28 Q160 17 176 24" />
        <circle cx="138" cy="34" r="1.8" fill="#C9A84C" stroke="none" />
        <circle cx="178" cy="30" r="1.8" fill="#C9A84C" stroke="none" />
      </g>

      {/* ── "DYP" serif text ── */}
      <text
        x="38"
        y="72"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="38"
        fill="#9B1C1C"
        letterSpacing="2"
      >
        DYP
      </text>

      {/* ── "DPU" serif text ── */}
      <text
        x="158"
        y="72"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="38"
        fill="#9B1C1C"
        letterSpacing="2"
      >
        DPU
      </text>

      {/* ── Gold horizontal rule ── */}
      <line x1="10" y1="82" x2="108" y2="82" stroke="#C9A84C" strokeWidth="1.8" />
      <line x1="132" y1="82" x2="230" y2="82" stroke="#C9A84C" strokeWidth="1.8" />

      {/* ── Centre dot on rule ── */}
      <circle cx="120" cy="82" r="3" fill="#9B1C1C" />
    </svg>
  );
}

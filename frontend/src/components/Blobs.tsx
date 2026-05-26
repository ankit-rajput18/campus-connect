export function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Primary indigo blob */}
      <div
        className="absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full animate-blob"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(79,70,229,0.10) 60%, transparent 100%)",
          filter: "blur(48px)",
        }}
      />
      {/* Violet blob */}
      <div
        className="absolute top-1/4 -right-40 h-[40rem] w-[40rem] rounded-full animate-blob [animation-delay:-7s]"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(124,58,237,0.08) 60%, transparent 100%)",
          filter: "blur(56px)",
        }}
      />
      {/* Sky accent blob */}
      <div
        className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full animate-blob [animation-delay:-14s]"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.16) 0%, rgba(6,182,212,0.07) 60%, transparent 100%)",
          filter: "blur(48px)",
        }}
      />
      {/* Subtle warm blob */}
      <div
        className="absolute top-2/3 right-1/4 h-[20rem] w-[20rem] rounded-full animate-blob [animation-delay:-3s]"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share } from "lucide-react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { Blobs } from "@/components/Blobs";

// ── Global deferred prompt store ─────────────────────────────────────────────
// Must be outside React so it's captured before any component mounts.
let _deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    // Notify any mounted component that the prompt is ready
    window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
  });

  // Register service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.error("[SW] registration failed:", err));
    });
  }
}

// ── 404 ───────────────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-8xl font-bold gradient-text mb-4">404</div>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 gradient-bg text-white font-semibold rounded-[14px] px-6 py-3 shadow-soft hover:shadow-glow transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center glass-card border border-white/70 rounded-[28px] p-10 shadow-float">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="font-display text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center gap-2 gradient-bg text-white font-semibold rounded-[14px] px-5 py-2.5 shadow-soft hover:shadow-glow transition"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 glass border border-white/60 font-semibold rounded-[14px] px-5 py-2.5 hover:shadow-soft transition"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Route ─────────────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Campus Connect — Dr. D. Y. Patil Institute of Technology" },
      {
        name: "description",
        content:
          "Campus Connect is the student exchange platform for Dr. D. Y. Patil Institute of Technology, Pimpri, Pune.",
      },
      { name: "theme-color", content: "#0078FF" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Campus Connect" },
      { property: "og:title", content: "Campus Connect — Dr. D. Y. Patil Institute of Technology" },
      { property: "og:description", content: "The student exchange platform built for DYP DPU, Pimpri, Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// ── PWA Install Popup ─────────────────────────────────────────────────────────
function PWAInstallPopup() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [promptReady, setPromptReady] = useState(false);
  const promptRef = useRef<any>(null);

  useEffect(() => {
    // Never show if already running as installed PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Show once per session (sessionStorage resets on tab close)
    if (sessionStorage.getItem("pwa-shown") === "1") return;

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // If the global prompt was already captured before this component mounted
    if (_deferredPrompt) {
      promptRef.current = _deferredPrompt;
      setPromptReady(true);
    }

    // Listen for prompt becoming available
    const onPromptReady = () => {
      promptRef.current = _deferredPrompt;
      setPromptReady(true);
    };
    window.addEventListener("pwa-prompt-ready", onPromptReady);

    // Show popup after 1.5s — enough time for the page to render
    const timer = setTimeout(() => {
      // On Android/Chrome: only show if we have the prompt OR it's iOS
      if (_deferredPrompt || ios) {
        setShow(true);
        sessionStorage.setItem("pwa-shown", "1");
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pwa-prompt-ready", onPromptReady);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = promptRef.current || _deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        _deferredPrompt = null;
        promptRef.current = null;
      }
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Card — slides up from bottom */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 inset-x-0 z-[91] px-4 pb-6 pt-2 flex justify-center"
          >
            <div className="w-full max-w-sm bg-white rounded-[28px] shadow-float overflow-hidden">

              {/* Blue header strip */}
              <div className="gradient-bg px-6 pt-6 pb-8 relative">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 grid h-7 w-7 place-items-center rounded-full bg-white/20 hover:bg-white/30 transition"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>

                <div className="flex items-center gap-4">
                  <img
                    src="/icons/icon-192.png"
                    alt="Campus Connect"
                    className="h-16 w-16 rounded-[18px] shadow-lg shrink-0 bg-white"
                  />
                  <div className="text-white">
                    <div className="font-display font-bold text-xl leading-tight">
                      Campus Connect
                    </div>
                    <div className="text-white/80 text-xs mt-0.5">
                      DYP DPU · Pimpri, Pune
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <p className="font-semibold text-base text-foreground mb-1">
                  {isIOS ? "Add to Home Screen" : "Install the App"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isIOS
                    ? "Get quick access from your home screen — no App Store needed."
                    : "Install Campus Connect for a faster, app-like experience on your device."}
                </p>

                {/* Feature list */}
                <div className="space-y-2 mb-5">
                  {[
                    { icon: "⚡", text: "Faster — loads instantly like a native app" },
                    { icon: "📴", text: "Works offline — browse without internet" },
                    { icon: "🏠", text: "Home screen icon — one tap to open" },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5 text-sm text-foreground/70">
                      <span className="text-base shrink-0">{f.icon}</span>
                      {f.text}
                    </div>
                  ))}
                </div>

                {/* iOS: step-by-step instructions */}
                {isIOS ? (
                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">1.</span>
                      <span>Tap the <Share className="inline h-4 w-4 mb-0.5" /> <strong>Share</strong> button in Safari</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">2.</span>
                      <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">3.</span>
                      <span>Tap <strong>Add</strong> — done!</span>
                    </div>
                  </div>
                ) : (
                  /* Android/Chrome: native install button */
                  <div className="flex gap-2">
                    <button
                      onClick={handleDismiss}
                      className="flex-1 py-3 rounded-[14px] text-sm font-semibold border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                    >
                      Not now
                    </button>
                    <button
                      onClick={handleInstall}
                      className="flex-[2] inline-flex items-center justify-center gap-2 gradient-bg text-white text-sm font-bold rounded-[14px] py-3 shadow-soft hover:shadow-glow transition"
                    >
                      <Download className="h-4 w-4" />
                      Install App
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Blobs />
      <Outlet />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 8px 32px -8px rgba(0,120,255,0.2), 0 2px 8px rgba(0,0,0,0.06)",
          },
        }}
      />
      <PWAInstallPopup />
    </QueryClientProvider>
  );
}

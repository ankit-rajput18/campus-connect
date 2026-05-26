import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { GoogleButton } from "@/components/GoogleButton";
import { Logo } from "@/components/Logo";
import { OnboardingOverlay } from "@/components/Onboarding";
import { toast } from "sonner";
import { signInWithGoogle } from "@/lib/firebase";
import { googleSignIn, handleAuthSuccess, setCachedUser } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Campus Connect" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Log API URL and host info on mount
  useEffect(() => {
    console.log("🌐 Host:", window.location.hostname);
    console.log("📱 Device:", /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "Mobile" : "Desktop");
  }, []);

  const handleGoogle = async () => {
    setLoading(true);

    try {
      console.log("🔵 Starting Google sign-in...");
      const idToken = await signInWithGoogle();
      console.log("🟢 Got idToken:", idToken ? "✅ Yes" : "❌ No");

      if (!idToken) {
        console.error("❌ No idToken returned from Firebase");
        toast.error("No token from Google");
        setLoading(false);
        return;
      }

      console.log("🔄 Sending token to backend...");
      const response = await googleSignIn({ idToken });
      console.log("🟡 Backend response:", response);

      if (response.error) {
        console.error("❌ Backend error:", response.error);
        toast.error(`Sign-in failed: ${response.error}`);
        setLoading(false);
        return;
      }

      if (response.data?.user.onboardingComplete) {
        handleAuthSuccess(response.data.token);
        setCachedUser(response.data.user);
        toast.success("Welcome back!");
        nav({ to: "/colleges" });
      } else {
        handleAuthSuccess(response.data!.token);
        setShowOnboarding(true);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("❌ Sign-in exception:", error);
      toast.error(`Error: ${error.message || "Google sign-in failed"}`);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-32 -left-24 h-[32rem] w-[32rem] rounded-full animate-blob"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)",
              filter: "blur(48px)",
            }}
          />

          <div
            className="absolute bottom-0 -right-24 h-[28rem] w-[28rem] rounded-full animate-blob [animation-delay:-8s]"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
              filter: "blur(48px)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Logo />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-md glass-card rounded-[28px] p-8 md:p-10 shadow-float border border-white/70"
        >
          <h1 className="font-display text-3xl font-bold text-center mb-3">
            Sign in with Google
          </h1>

          <p className="text-center text-sm text-muted-foreground mb-8">
            Use your DYP DPU account to access Campus Connect.
          </p>

          <GoogleButton
            onClick={handleGoogle}
            label={loading ? "Connecting…" : "Continue with Google"}
          />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>.
          </p>
        </motion.div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs">
          Only Google sign-in is supported for Campus Connect.
        </p>
      </div>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingOverlay onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
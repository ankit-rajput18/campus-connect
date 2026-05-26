import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, BookOpen, Camera, Check, ChevronDown, X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DypDpuLogo } from "@/components/DypDpuLogo";
import { toast } from "sonner";
import { onboardUser, notifyUserUpdated } from "@/lib/api";

const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "AIDS (AI & Data Science)",
  "AIML (AI & Machine Learning)",
];

const SEMESTERS = ["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6","Sem 7","Sem 8"];

export interface OnboardingData {
  name: string;
  department: string;
  semester: string;
  avatar: string | null;
}

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
            s < step ? "gradient-bg text-white shadow-soft"
            : s === step ? "gradient-bg text-white shadow-glow ring-4 ring-primary/20"
            : "bg-muted text-muted-foreground"
          }`}>
            {s < step ? <Check className="h-3.5 w-3.5" /> : s}
          </div>
          {s < 3 && (
            <div className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
              <motion.div className="h-full gradient-bg"
                initial={{ width: "0%" }}
                animate={{ width: s < step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ data, onChange, onNext }: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}) {
  return (
    <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <div className="grid h-14 w-14 mx-auto place-items-center rounded-[18px] gradient-bg text-white shadow-soft mb-6">
        <User className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-bold text-center mb-1">What's your name?</h2>
      <p className="text-center text-sm text-muted-foreground mb-8">
        This is how other students will see you on Campus Connect.
      </p>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
        Full Name <span className="text-primary">*</span>
      </label>
      <input type="text" autoFocus value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="e.g. Aarav Patil" className="field-input mb-6" />
      <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
        onClick={onNext} disabled={!data.name.trim()}
        className="w-full gradient-bg text-white font-semibold rounded-[14px] py-3.5 shadow-soft hover:shadow-glow transition-all duration-200 disabled:opacity-50">
        Continue →
      </motion.button>
    </motion.div>
  );
}

function Step2({ data, onChange, onNext, onBack }: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <div className="grid h-14 w-14 mx-auto place-items-center rounded-[18px] gradient-bg text-white shadow-soft mb-6">
        <BookOpen className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-bold text-center mb-1">Tell us about your studies</h2>
      <p className="text-center text-sm text-muted-foreground mb-8">Helps us show you the most relevant listings.</p>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
        Department <span className="text-primary">*</span>
      </label>
      <div className="relative mb-5">
        <select value={data.department} onChange={(e) => onChange({ department: e.target.value })}
          className="field-input appearance-none pr-9">
          <option value="">Select your department…</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Current Semester <span className="text-primary">*</span>
      </label>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {SEMESTERS.map((s) => (
          <motion.button key={s} type="button" whileTap={{ scale: 0.9 }}
            onClick={() => onChange({ semester: s })}
            className={`py-2.5 rounded-[12px] text-sm font-semibold border-2 transition-all duration-200 ${
              data.semester === s
                ? "gradient-bg text-white border-transparent shadow-soft"
                : "bg-white/60 border-border/60 text-foreground/70 hover:border-primary/40"
            }`}>
            {s}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 bg-white/70 hover:bg-white border border-white/60 rounded-[14px] py-3.5 text-sm font-semibold transition">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
          onClick={onNext} disabled={!data.department || !data.semester}
          className="flex-[2] gradient-bg text-white font-semibold rounded-[14px] py-3.5 shadow-soft hover:shadow-glow transition-all duration-200 disabled:opacity-50">
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
}

function Step3({ data, onChange, onFinish, onBack, finishing, onAvatarFileChange }: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
  finishing: boolean;
  onAvatarFileChange: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ avatar: reader.result as string });
    reader.readAsDataURL(file);
    onAvatarFileChange(file);
  };
  const initials = data.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <div className="grid h-14 w-14 mx-auto place-items-center rounded-[18px] gradient-bg text-white shadow-soft mb-6">
        <Camera className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-bold text-center mb-1">Add a profile photo</h2>
      <p className="text-center text-sm text-muted-foreground mb-8">Optional — you can always add one later.</p>
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative">
          {data.avatar
            ? <img src={data.avatar} alt="avatar" className="h-28 w-28 rounded-[22px] object-cover ring-4 ring-white shadow-glow" />
            : <div className="h-28 w-28 rounded-[22px] gradient-bg flex items-center justify-center ring-4 ring-white shadow-glow">
                <span className="font-display text-3xl font-bold text-white">{initials}</span>
              </div>
          }
          {data.avatar && (
            <button onClick={() => onChange({ avatar: null })}
              className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-white shadow-soft border border-white/60 text-muted-foreground hover:text-destructive transition">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 glass-strong border border-white/60 rounded-[12px] px-5 py-2.5 text-sm font-semibold hover:shadow-soft transition">
          <Camera className="h-4 w-4" />
          {data.avatar ? "Change photo" : "Upload photo"}
        </motion.button>
      </div>
      <div className="bg-muted/40 rounded-[16px] p-4 mb-8 space-y-2">
        {[["Name", data.name], ["Department", data.department], ["Semester", data.semester]].map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-semibold text-right max-w-[60%] leading-snug">{v}</span>
            </div>
            {k !== "Semester" && <div className="h-px bg-border/40 mt-2" />}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 bg-white/70 hover:bg-white border border-white/60 rounded-[14px] py-3.5 text-sm font-semibold transition">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
          onClick={onFinish} disabled={finishing}
          className="flex-[2] gradient-bg text-white font-bold rounded-[14px] py-3.5 shadow-soft hover:shadow-glow transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2">
          {finishing ? (
            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>Setting up…</>
          ) : (
            <><Check className="h-4 w-4" /> Finish & Enter</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export function OnboardingOverlay({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [finishing, setFinishing] = useState(false);
  const [data, setData] = useState<OnboardingData>({ name: "", department: "", semester: "", avatar: null });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const update = (d: Partial<OnboardingData>) => setData((p) => ({ ...p, ...d }));
  const stepLabels = ["Your Name", "Your Studies", "Profile Photo"];

  const handleFinish = async () => {
    setFinishing(true);
    try {
      // Prepare the payload
      const payload: any = {
        name: data.name,
        department: data.department,
        semester: data.semester,
      };

      // Add avatar file if selected
      if (avatarFile) {
        payload.avatar = avatarFile;
      }

      // Call the backend to save onboarding data
      const response = await onboardUser(payload);

      if (response.error) {
        toast.error(response.error);
        setFinishing(false);
        return;
      }

      // Cache the user so navbar avatar shows immediately after redirect
      if (response.data?.user) {
        notifyUserUpdated(response.data.user);
      }

      toast.success(`Welcome, ${data.name}! 🎉`, { description: "Your profile is all set." });
      nav({ to: "/colleges" });
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
      setFinishing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md glass-card border border-white/70 rounded-[28px] p-8 shadow-float relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-xl bg-white/60 hover:bg-white transition text-muted-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-[14px] px-4 py-2 shadow-card border border-white/70">
            <DypDpuLogo size={28} />
          </div>
        </div>
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Step {step} of 3 — {stepLabels[step - 1]}
        </p>
        <StepBar step={step} />
        <AnimatePresence mode="wait">
          {step === 1 && <Step1 key="s1" data={data} onChange={update} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 key="s2" data={data} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 key="s3" data={data} onChange={update} onFinish={handleFinish} onBack={() => setStep(2)} finishing={finishing} onAvatarFileChange={setAvatarFile} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

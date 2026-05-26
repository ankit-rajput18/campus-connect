import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImagePlus, X, Sparkles, ChevronDown, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { categories } from "@/lib/mock-data";
import { createPost, isAuthenticated } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/create-post")({
  head: () => ({ meta: [{ title: "Create Post — Campus Connect" }] }),
  component: CreatePost,
});

const listingTypes = [
  { value: "exchange", label: "Exchange", emoji: "🔄", desc: "Swap for something else" },
  { value: "sell", label: "Sell", emoji: "💰", desc: "Sell at a price" },
  { value: "rent", label: "Rent", emoji: "📅", desc: "Lend temporarily" },
  { value: "donate", label: "Donate", emoji: "🎁", desc: "Give for free" },
];

const conditions = ["Like New", "Good", "Fair", "Used"];

function CreatePost() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [listingType, setListingType] = useState("exchange");
  const [condition, setCondition] = useState("Good");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "Books");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      nav({ to: "/auth" });
    }
  }, [nav]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Max file size is 10MB." });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !contact) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createPost({
        title,
        description,
        category,
        listingType,
        condition,
        contact,
        image: imageFile || undefined,
      });

      if (response.error) {
        toast.error(response.error, { description: response.message });
        return;
      }

      toast.success("Post published!", {
        description: "Your listing is now live on the campus feed.",
      });
      nav({ to: "/my-posts" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            New Listing
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Create a <span className="gradient-text">post</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share something with your campus in seconds.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="glass-card rounded-[28px] p-6 md:p-8 shadow-float border border-white/70 space-y-6"
        >
          {/* Listing type selector */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Listing Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {listingTypes.map((t) => (
                <motion.button
                  key={t.value}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setListingType(t.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-[14px] border-2 transition-all duration-200 ${
                    listingType === t.value
                      ? "border-primary/60 bg-primary/5 shadow-soft"
                      : "border-border/60 bg-white/50 hover:border-primary/30"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {t.desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Photo
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileRef.current?.click()}
              className={`relative cursor-pointer rounded-[18px] border-2 border-dashed transition-all duration-200 ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : imagePreview
                  ? "border-transparent"
                  : "border-border/60 bg-white/40 hover:border-primary/40 hover:bg-primary/3"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                  >
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full max-h-72 object-cover rounded-[16px]"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-[16px] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">Click to change</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                      className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-soft hover:bg-white transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-10 text-center"
                  >
                    <div className="grid h-14 w-14 mx-auto place-items-center rounded-[18px] gradient-bg text-white shadow-soft mb-4">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <div className="font-semibold text-sm mb-1">
                      Drag & drop or click to upload
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Title" required>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field-input"
                placeholder="e.g. Engineering Mathematics Vol. 2"
              />
            </Field>

            <Field label="Category" required>
              <div className="relative">
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field-input appearance-none pr-9"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field label="Condition" required>
              <div className="relative">
                <select
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="field-input appearance-none pr-9"
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field label="Contact (WhatsApp / Email)" required>
              <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="field-input"
              placeholder="+91 98765 43210"
            />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field-input resize-none"
              placeholder="Tell other students about your item — condition, why you're listing it, any extras included…"
            />
          </Field>

          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-[14px] p-3.5">
            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Your post will be visible to all verified students at Dr. D. Y. Patil Institute of Technology. Make sure your
              contact details are correct so interested students can reach you.
            </p>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full gradient-bg text-white font-bold rounded-[16px] py-4 shadow-soft hover:shadow-glow transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publishing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Publish Post
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-primary">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

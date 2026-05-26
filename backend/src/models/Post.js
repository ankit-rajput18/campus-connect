import mongoose from "mongoose";

const CATEGORIES = ["Books", "Notes", "Electronics", "Hostel Essentials", "Others"];
const STATUSES = ["Available", "Pending", "Exchanged"];
const LISTING_TYPES = ["exchange", "sell", "rent", "donate"];
const CONDITIONS = ["Like New", "Good", "Fair", "Used"];

// ── College slug map ──────────────────────────────────────────────────────────
// Maps the college name stored on the User to a short prefix for the postRef.
// Add more colleges here if the platform expands.
export const COLLEGE_SLUG_MAP = {
  "Dr. D. Y. Patil Institute of Technology": "DYPIT_PIMPRI",
  "DYP DPU": "DYPIT_PIMPRI",
};

export function getCollegeSlug(collegeName = "") {
  const key = Object.keys(COLLEGE_SLUG_MAP).find((k) =>
    collegeName.toLowerCase().includes(k.toLowerCase())
  );
  return COLLEGE_SLUG_MAP[key] ?? "CAMPUS";
}

const postSchema = new mongoose.Schema(
  {
    // ── Human-readable reference ID ───────────────────────
    // Format: <COLLEGE_SLUG>_<zero-padded-sequence>
    // Example: DYPIT_PIMPRI_0001
    postRef: {
      type: String,
      unique: true,
      sparse: true, // allows null on old docs, enforces uniqueness when set
      index: true,
    },

    // ── Core content ──────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: CATEGORIES,
    },
    listingType: {
      type: String,
      enum: LISTING_TYPES,
      default: "exchange",
    },
    condition: {
      type: String,
      enum: CONDITIONS,
      default: "Good",
    },
    contact: {
      type: String,
      required: [true, "Contact info is required"],
      trim: true,
    },

    // ── Image (stored on Cloudinary) ──────────────────────
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },

    // ── Status ────────────────────────────────────────────
    status: {
      type: String,
      enum: STATUSES,
      default: "Available",
    },

    // ── Owner ─────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Engagement ────────────────────────────────────────
    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    requests: [
      {
        requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String, default: "" },
        status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
        respondedAt: { type: Date },
        responder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search
postSchema.index({ title: "text", description: "text" });
// Compound index for common feed query
postSchema.index({ category: 1, status: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;

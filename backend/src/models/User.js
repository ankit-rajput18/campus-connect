import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      // Not required — Google sign-in users won't have a password
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },

    // ── Auth provider ─────────────────────────────────────
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    firebaseUid: {
      type: String,
      sparse: true, // allows null but enforces uniqueness when set
      unique: true,
    },

    // ── Profile ───────────────────────────────────────────
    avatar: {
      type: String, // Cloudinary URL
      default: "",
    },
    avatarPublicId: {
      type: String, // Cloudinary public_id for deletion/replacement
      default: "",
    },
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },

    // ── Academic info (set during onboarding) ─────────────
    department: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
    },
    year: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },
    college: {
      type: String,
      default: "Dr. D. Y. Patil Institute of Technology",
    },

    // ── Onboarding flag ───────────────────────────────────
    onboardingComplete: {
      type: Boolean,
      default: false,
    },

    // ── Stats (denormalized for fast reads) ───────────────
    totalPosts: { type: Number, default: 0 },
    totalExchanges: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual: full profile URL (optional helper)
userSchema.virtual("profileUrl").get(function () {
  return `/users/${this._id}`;
});

const User = mongoose.model("User", userSchema);
export default User;

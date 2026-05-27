import User from "../models/User.js";
import Post from "../models/Post.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../middleware/upload.js";
import { getIo } from "../socket/socket.js";

// ── PUT /api/users/onboard ────────────────────────────────────────────────────
// Called after Google sign-in to complete the 3-step onboarding flow.
export const onboardUser = async (req, res) => {
  try {
    const { name, department, semester } = req.body;

    if (!name || !department || !semester) {
      return res.status(400).json({ message: "Name, department and semester are required" });
    }

    const updateData = {
      name,
      department,
      semester,
      onboardingComplete: true,
    };

    // Multer may populate `req.files` as an object (fields) or as an array (upload.any()).
    // Normalize to `avatarFile` and `backgroundFile` variables.
    let avatarFile = null;
    let backgroundFile = null;
    if (Array.isArray(req.files)) {
      for (const f of req.files) {
        if (f.fieldname === "avatar") avatarFile = f;
        if (f.fieldname === "backgroundImage") backgroundFile = f;
      }
    } else {
      avatarFile = req.file || (req.files?.avatar && req.files.avatar[0]);
      backgroundFile = req.files?.backgroundImage?.[0];
    }

    // Handle avatar upload if a file was sent
    if (avatarFile) {
      if (req.user.avatarPublicId) {
        await deleteFromCloudinary(req.user.avatarPublicId);
      }
      const result = await uploadToCloudinary(avatarFile.buffer, "avatars");
      console.log("Avatar upload result:", result && result.public_id ? result.public_id : result);
      updateData.avatar = result.secure_url;
      updateData.avatarPublicId = result.public_id;
    }

    // Handle banner/background upload if a file was sent
    if (backgroundFile) {
      if (req.user.backgroundImagePublicId) {
        await deleteFromCloudinary(req.user.backgroundImagePublicId);
      }
      const result = await uploadToCloudinary(backgroundFile.buffer, "backgrounds");
      console.log("Background upload result:", result && result.public_id ? result.public_id : result);
      updateData.backgroundImage = result.secure_url;
      updateData.backgroundImagePublicId = result.public_id;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    // Notify connected clients about the updated user so UI can refresh in real-time
    try {
      const io = getIo();
      if (io) io.emit("user_updated", { user });
    } catch (e) {
      console.warn("Failed to emit user_updated socket event:", e.message || e);
    }

    res.status(200).json({ message: "Onboarding complete", user });
  } catch (error) {
    console.error("Onboard error:", error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -firebaseUid -avatarPublicId -backgroundImagePublicId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get their post count
    const postCount = await Post.countDocuments({ author: user._id });

    res.status(200).json({ user: { ...user.toObject(), totalPosts: postCount } });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────────
// Update the currently logged-in user's profile.
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, year, branch, department, semester } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (year !== undefined) updateData.year = year;
    if (branch !== undefined) updateData.branch = branch;
    if (department !== undefined) updateData.department = department;
    if (semester !== undefined) updateData.semester = semester;

    // Multer may populate `req.files` as an object (fields) or as an array (upload.any()).
    // Normalize to `avatarFile` and `backgroundFile` variables.
    let avatarFile = null;
    let backgroundFile = null;
    if (Array.isArray(req.files)) {
      for (const f of req.files) {
        if (f.fieldname === "avatar") avatarFile = f;
        if (f.fieldname === "backgroundImage") backgroundFile = f;
      }
    } else {
      avatarFile = req.file || (req.files?.avatar && req.files.avatar[0]);
      backgroundFile = req.files?.backgroundImage?.[0];
    }

    // Handle avatar upload
    if (avatarFile) {
      if (req.user.avatarPublicId) {
        await deleteFromCloudinary(req.user.avatarPublicId);
      }
      const result = await uploadToCloudinary(avatarFile.buffer, "avatars");
      console.log("Avatar upload result:", result && result.public_id ? result.public_id : result);
      updateData.avatar = result.secure_url;
      updateData.avatarPublicId = result.public_id;
    }

    // Handle background/banner upload
    if (backgroundFile) {
      if (req.user.backgroundImagePublicId) {
        await deleteFromCloudinary(req.user.backgroundImagePublicId);
      }
      const result = await uploadToCloudinary(backgroundFile.buffer, "backgrounds");
      console.log("Background upload result:", result && result.public_id ? result.public_id : result);
      updateData.backgroundImage = result.secure_url;
      updateData.backgroundImagePublicId = result.public_id;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -firebaseUid -avatarPublicId -backgroundImagePublicId");

    // Notify connected clients about the updated user so UI can refresh in real-time
    try {
      const io = getIo();
      if (io) io.emit("user_updated", { user });
    } catch (e) {
      console.warn("Failed to emit user_updated socket event:", e.message || e);
    }

    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

// ── GET /api/users/profile ────────────────────────────────────────────────────
// Get the currently logged-in user's full profile + stats.
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -firebaseUid -avatarPublicId -backgroundImagePublicId");

    const [totalPosts, totalExchanges, totalViews, bookPosts, recentPosts] = await Promise.all([
      Post.countDocuments({ author: req.user._id }),
      Post.countDocuments({ author: req.user._id, status: "Exchanged" }),
      Post.aggregate([
        { $match: { author: req.user._id } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]).then((result) => (result[0]?.total ?? 0)),
      Post.countDocuments({ author: req.user._id, category: "Books" }),
      Post.find({ author: req.user._id })
        .sort({ createdAt: -1 })
        .limit(4)
        .select("title status createdAt"),
    ]);

    res.status(200).json({
      user: {
        ...user.toObject(),
        totalPosts,
        totalExchanges,
        totalViews,
        bookPosts,
        recentPosts,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

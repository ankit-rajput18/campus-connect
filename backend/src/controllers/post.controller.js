import Post, { getCollegeSlug } from "../models/Post.js";
import User from "../models/User.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../middleware/upload.js";

// ── GET /api/posts ─────────────────────────────────────────────────────────────
// Public feed — supports filtering, searching, sorting, pagination.
export const getPosts = async (req, res) => {
  try {
    const {
      category,
      search,
      sort = "recent",
      page = 1,
      limit = 12,
      status,
    } = req.query;

    // Build filter
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ["Available", "Pending"] };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    let sortOption = { createdAt: -1 }; // default: recent
    if (sort === "trending") sortOption = { interestedUsers: -1, createdAt: -1 };
    if (sort === "hot") sortOption = { views: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate("author", "name avatar college department"),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      posts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};

// ── GET /api/posts/my ─────────────────────────────────────────────────────────
// Get all posts by the logged-in user.
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar college")
      .populate("requests.requester", "name avatar college email");

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/posts/:id ────────────────────────────────────────────────────────
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name avatar college department semester"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count (fire-and-forget)
    Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.status(200).json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/posts ───────────────────────────────────────────────────────────
export const createPost = async (req, res) => {
  try {
    const { title, description, category, listingType, condition, contact } = req.body;

    if (!title || !description || !category || !contact) {
      return res.status(400).json({ message: "Title, description, category and contact are required" });
    }

    // ── Generate college-prefixed postRef ─────────────────
    // Get the author's college to build the slug (e.g. DYPIT_PIMPRI)
    const author = await User.findById(req.user._id).select("college");
    const slug = getCollegeSlug(author?.college || "");

    // Count existing posts with this slug prefix to get the next sequence number
    const count = await Post.countDocuments({ postRef: new RegExp(`^${slug}_`) });
    const sequence = String(count + 1).padStart(4, "0"); // 0001, 0002, …
    const postRef = `${slug}_${sequence}`;

    const postData = {
      postRef,
      title,
      description,
      category,
      listingType: listingType || "exchange",
      condition: condition || "Good",
      contact,
      author: req.user._id,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "posts");
      postData.image = result.secure_url;
      postData.imagePublicId = result.public_id;
    }

    const post = await Post.create(postData);

    // Increment user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPosts: 1 } });

    const populated = await post.populate("author", "name avatar college");

    res.status(201).json({ message: "Post created successfully", post: populated });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error creating post" });
  }
};

// ── PUT /api/posts/:id ────────────────────────────────────────────────────────
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the author can edit
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { title, description, category, listingType, condition, contact, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (listingType !== undefined) updateData.listingType = listingType;
    if (condition !== undefined) updateData.condition = condition;
    if (contact !== undefined) updateData.contact = contact;
    if (status !== undefined) updateData.status = status;

    // Replace image if a new one is uploaded
    if (req.file) {
      if (post.imagePublicId) {
        await deleteFromCloudinary(post.imagePublicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, "posts");
      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updated = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name avatar college");

    res.status(200).json({ message: "Post updated", post: updated });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error updating post" });
  }
};

// ── PATCH /api/posts/:id/status ───────────────────────────────────────────────
export const updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Available", "Pending", "Exchanged"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If marking as Exchanged, increment user's exchange count
    if (status === "Exchanged" && post.status !== "Exchanged") {
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalExchanges: 1 } });
    }

    post.status = status;
    await post.save();

    res.status(200).json({ message: "Status updated", post });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete image from Cloudinary
    if (post.imagePublicId) {
      await deleteFromCloudinary(post.imagePublicId);
    }

    await post.deleteOne();

    // Decrement user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPosts: -1 } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error deleting post" });
  }
};

// ── GET /api/posts/notifications ─────────────────────────────────────────────
// Returns all pending interest requests received on the logged-in user's posts.
export const getNotifications = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .select("title image requests")
      .populate("requests.requester", "name avatar college department");

    const notifications = [];
    for (const post of posts) {
      for (const req of post.requests) {
        notifications.push({
          postId: post._id,
          postTitle: post.title,
          postImage: post.image,
          requestId: req._id,
          requester: req.requester,
          message: req.message,
          status: req.status,
          createdAt: req.createdAt || null,
        });
      }
    }

    // Sort newest first (by _id which is ObjectId with timestamp)
    notifications.sort((a, b) => {
      const aTime = a.requestId?.toString() ?? "";
      const bTime = b.requestId?.toString() ?? "";
      return bTime.localeCompare(aTime);
    });

    const pendingCount = notifications.filter((n) => n.status === "Pending").length;

    res.status(200).json({ notifications, pendingCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// ── POST /api/posts/:id/interest ──────────────────────────────────────────────
// Toggle interest on a post (adds/removes user from interestedUsers array).
export const toggleInterest = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    // If the user already has a pending request, cancel it
    const existingIndex = post.requests.findIndex(
      (r) => r.requester?.toString() === userId.toString() && r.status === "Pending"
    );

    if (existingIndex !== -1) {
      // remove request and remove from interestedUsers
      post.requests.splice(existingIndex, 1);
      post.interestedUsers = post.interestedUsers.filter((id) => id.toString() !== userId.toString());
      await post.save();
      return res.status(200).json({ message: "Interest cancelled", interested: false, count: post.interestedUsers.length });
    }

    // Create a new request subdocument
    const request = {
      requester: userId,
      message: req.body?.message || "",
      status: "Pending",
    };
    post.requests.push(request);
    // Add to interestedUsers for quick counts
    if (!post.interestedUsers.includes(userId)) post.interestedUsers.push(userId);
    await post.save();

    const created = post.requests[post.requests.length - 1];
    res.status(201).json({ message: "Interest registered", interested: true, count: post.interestedUsers.length, request: created });
  } catch (error) {
    console.error("Toggle interest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/posts/:postId/requests/:requestId/respond ─────────────────────
export const respondToRequest = async (req, res) => {
  try {
    const { postId, requestId } = req.params;
    const { action } = req.body; // "accept" or "reject"

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accept' or 'reject'" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const reqIndex = post.requests.findIndex((r) => r._id.toString() === requestId);
    if (reqIndex === -1) return res.status(404).json({ message: "Request not found" });

    const request = post.requests[reqIndex];
    request.status = action === "accept" ? "Accepted" : "Rejected";
    request.respondedAt = new Date();
    request.responder = req.user._id;

    // If accepted, mark post as Pending so owner can finalize exchange
    if (action === "accept") {
      post.status = "Pending";
    }

    await post.save();

    res.status(200).json({ message: `Request ${action}ed`, request, post });
  } catch (error) {
    console.error("Respond to request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

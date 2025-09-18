const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Reaction = require("../models/reactionModel");
const User = require("../models/userModel");

// Create a Post
exports.createPost = async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;

    const post = await Post.create({
      content,
      mediaUrl,
      user: req.user._id,
    });

    // Populate user -> profile
    await post.populate({
      path: "user",
      select: "email role",
      populate: {
        path: "profile",
        select: "name profilePicture username",
      },
    });

    res.status(201).json({ status: "success", post });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// Get All Posts
// Get All Posts (with Pagination)
exports.getAllPosts = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page, 10) || 1;   // default page = 1
    const limit = parseInt(req.query.limit, 10) || 10; // default limit = 10
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalPosts = await Post.countDocuments({ deleted: false });

    // Fetch posts with pagination
    const posts = await Post.find({ deleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // newest first
      .populate({
        path: "user",
        select: "email role",
        populate: {
          path: "profile",
          select: "name profilePicture username",
        },
      })
      .lean();

    // Fetch comments & reactions for each post
    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ post: post._id })
          .populate({
            path: "user",
            select: "email role",
            populate: {
              path: "profile",
              select: "name profilePicture username",
            },
          })
          .lean();

        const reactions = await Reaction.find({ post: post._id })
          .populate({
            path: "user",
            select: "email role",
            populate: {
              path: "profile",
              select: "name profilePicture username",
            },
          })
          .lean();

        return {
          ...post,
          comments,
          reactions,
          commentCount: comments.length,
          reactionCount: reactions.length,
        };
      })
    );

    // Response with metadata
    res.status(200).json({
      status: "success",
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        pageSize: limit,
      },
      posts: postsWithExtras,
    });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get Post by ID
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate({
        path: "user",
        select: "email role",
        populate: {
          path: "profile",
          select: "name profilePicture username",
        },
      })
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ post: postId })
      .populate({
        path: "user",
        select: "email role",
        populate: {
          path: "profile",
          select: "name profilePicture username",
        },
      })
      .lean();

    const reactions = await Reaction.find({ post: postId })
      .populate({
        path: "user",
        select: "email role",
        populate: {
          path: "profile",
          select: "name profilePicture username",
        },
      })
      .lean();

    res.status(200).json({
      status: "success",
      post,
      comments,
      reactions,
      commentCount: comments.length,
      reactionCount: reactions.length,
    });
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, mediaUrl } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.content = content || post.content;
    post.mediaUrl = mediaUrl || post.mediaUrl;

    await post.save();

    res.status(200).json({ status: "success", post });
  } catch (error) {
    console.error("❌ Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.remove();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

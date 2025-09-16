const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Reaction = require("../models/reactionModel");
const Profile = require("../models/profileModel");

exports.createPost = async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;

    // Create a new post
    const post = await Post.create({
      content,
      mediaUrl,
      user: req.user._id,
    });

    // Populate the user field for the post
    await post.populate({
      path: "user",
      select: "name profilePicture", // Select the name and profilePicture fields
    }).execPopulate();

    res.status(201).json({ status: "success", post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ deleted: false })
      .populate("user", "name profilePicture") // Populate the user field for posts
      .lean();

    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        // Fetch and populate comments with user data
        const comments = await Comment.find({ post: post._id })
          .populate("user", "name profilePicture") // Populate user for comments
          .lean();

        // Fetch and populate reactions with user data
        const reactions = await Reaction.find({ post: post._id })
          .populate("user", "name profilePicture") // Populate user for reactions
          .lean();

        return {
          ...post,
          comments, // Add populated comments
          reactions, // Add populated reactions
          commentCount: comments.length, // Count of comments
          reactionCount: reactions.length, // Count of reactions
        };
      })
    );

    res.status(200).json(postsWithExtras);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate("user", "name profilePicture") // Populate user for the post
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch and populate comments with user data
    const comments = await Comment.find({ post: postId })
      .populate("user", "name profilePicture")
      .lean();

    // Fetch and populate reactions with user data
    const reactions = await Reaction.find({ post: postId })
      .populate("user", "name profilePicture")
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
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

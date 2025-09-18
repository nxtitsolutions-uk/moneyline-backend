const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Manage social media posts
 */

/**
 * @swagger
 * /posts/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The text content of the post.
 *                 example: "Hello, this is my first post!"
 *               mediaUrl:
 *                 type: string
 *                 description: URL of the media (image/video).
 *                 example: "http://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully with populated user data.
 *       400:
 *         description: Invalid data.
 *       500:
 *         description: Server error.
 */
router.post("/create", postController.createPost);

/**
 * @swagger
 * /posts/get:
 *   get:
 *     summary: Get all posts (with pagination)
 *     description: Retrieve posts with their comments and reactions. Supports pagination using query parameters.
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page.
 *     responses:
 *       200:
 *         description: A list of posts with comments, reactions, and pagination metadata.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.get("/get", postController.getAllPosts);


/**
 * @swagger
 * /posts/get/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post.
 *     responses:
 *       200:
 *         description: The post with populated comments and reactions.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Server error.
 */
router.get("/get/:id", postController.getPostById);

/**
 * @swagger
 * /posts/update/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated text content.
 *                 example: "Updated content of my post"
 *               mediaUrl:
 *                 type: string
 *                 description: Updated media URL.
 *                 example: "http://example.com/newimage.jpg"
 *     responses:
 *       200:
 *         description: Post updated successfully.
 *       403:
 *         description: Unauthorized - you cannot edit this post.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Failed to update post.
 */
router.put("/update/:id", postController.updatePost);

/**
 * @swagger
 * /posts/delete/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post.
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *       403:
 *         description: Unauthorized - you cannot delete this post.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Failed to delete post.
 */
router.delete("/delete/:id", postController.deletePost);

module.exports = router;

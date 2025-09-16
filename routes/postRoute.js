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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "68c9460dad370a45c55fea8d"
 *                     content:
 *                       type: string
 *                       example: "Hello, this is my first post!"
 *                     mediaUrl:
 *                       type: string
 *                       example: "http://example.com/image.jpg"
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "68863134fb33901deede2d63"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         profilePicture:
 *                           type: string
 *                           example: "http://example.com/images/john.jpg"
 *                     deleted:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-16T11:12:13.380Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-16T11:12:13.380Z"
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
 *     summary: Get all posts
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all posts with comments and reactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "68c9460dad370a45c55fea8d"
 *                   content:
 *                     type: string
 *                     example: "Hello, this is my first post!"
 *                   mediaUrl:
 *                     type: string
 *                     example: "http://example.com/image.jpg"
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68863134fb33901deede2d63"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       profilePicture:
 *                         type: string
 *                         example: "http://example.com/images/john.jpg"
 *                   comments:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60c72b2f9b1e8b001c8e4a9c"
 *                         text:
 *                           type: string
 *                           example: "Great post!"
 *                         user:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "68863134fb33901deede2d63"
 *                             name:
 *                               type: string
 *                               example: "John Doe"
 *                             profilePicture:
 *                               type: string
 *                               example: "http://example.com/images/john.jpg"
 *                   reactions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60c72b2f9b1e8b001c8e4a9d"
 *                         type:
 *                           type: string
 *                           example: "like"
 *                         user:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "68863134fb33901deede2d63"
 *                             name:
 *                               type: string
 *                               example: "John Doe"
 *                             profilePicture:
 *                               type: string
 *                               example: "http://example.com/images/john.jpg"
 *                   commentCount:
 *                     type: integer
 *                     example: 10
 *                   reactionCount:
 *                     type: integer
 *                     example: 5
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "68c9460dad370a45c55fea8d"
 *                     content:
 *                       type: string
 *                       example: "Hello, this is my first post!"
 *                     mediaUrl:
 *                       type: string
 *                       example: "http://example.com/image.jpg"
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "68863134fb33901deede2d63"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         profilePicture:
 *                           type: string
 *                           example: "http://example.com/images/john.jpg"
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60c72b2f9b1e8b001c8e4a9c"
 *                           text:
 *                             type: string
 *                             example: "Great post!"
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "68863134fb33901deede2d63"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               profilePicture:
 *                                 type: string
 *                                 example: "http://example.com/images/john.jpg"
 *                     reactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60c72b2f9b1e8b001c8e4a9d"
 *                           type:
 *                             type: string
 *                             example: "like"
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "68863134fb33901deede2d63"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               profilePicture:
 *                                 type: string
 *                                 example: "http://example.com/images/john.jpg"
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Server error.
 */
router.get("/get/:id", postController.getPostById);

module.exports = router;

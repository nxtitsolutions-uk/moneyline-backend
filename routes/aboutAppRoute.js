const express = require("express");
const router = express.Router();
const aboutAppController = require("../controllers/aboutAppController");
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: AboutApp
 *   description: Manage About App content
 */

/**
 * @swagger
 * /about-app:
 *   get:
 *     summary: Get latest About App content
 *     tags: [AboutApp]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           example: en
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           example: android
 *     responses:
 *       200:
 *         description: About content fetched
 */
router.get("/", aboutAppController.getAboutApp);

/**
 * @swagger
 * /about-app:
 *   post:
 *     summary: Create new About App content
 *     tags: [AboutApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *               language:
 *                 type: string
 *                 example: en
 *               platform:
 *                 type: string
 *                 example: android
 *     responses:
 *       201:
 *         description: About content created
 */
router.post("/", authenticate, restrictTo("admin"), aboutAppController.createAboutApp);

/**
 * @swagger
 * /about-app/{id}:
 *   patch:
 *     summary: Update About App content by ID
 *     tags: [AboutApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               language:
 *                 type: string
 *               platform:
 *                 type: string
 *     responses:
 *       200:
 *         description: About content updated
 */
router.patch("/:id", authenticate, restrictTo("admin"), aboutAppController.updateAboutApp);

/**
 * @swagger
 * /about-app/{id}:
 *   delete:
 *     summary: Delete About App content by ID
 *     tags: [AboutApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: About content deleted
 */
router.delete("/:id", authenticate, restrictTo("admin"), aboutAppController.deleteAboutApp);

module.exports = router;

const express = require('express');
const router = express.Router();


// Import all modules
const authRoutes = require('./authRoute');
const s3Routes = require('./s3Route');
const invitationRoutes = require('./invitationRoute');
const profileRoutes = require("./profileRoute");
const userRoutes = require('./userRoute');
const sportRoutes = require('./sportRoute');
const subscriptionRoutes = require('./subscriptionRoute');
const notificationRoutes = require('./notificationRoute');
const feedbackRoutes = require('./feedbackRoute');
const aboutRoutes = require('./aboutAppRoute');
const termsRoutes = require('./termsAndConditionsRoute');
const privacyRoutes = require('./privacyPolicyRoute');
const postRoutes = require('./postRoute');
const commentRoutes = require('./commentRoute');
const reactionRoutes = require('./reactionRoute');
const reportRoutes = require('./reportRoute');
const footballRoutes = require('./footballRoute');
// const nbaRoutes = require('./nbaRoute');
const nflRoutes = require('./nflRoute');
const adminVoteRoute = require('./adminVoteRoute');
const predictionRoute = require('./predictionRoute');
const stripeRoutes = require('./stripeRoute');
const analyticsRoutes = require('./analyticsRoute');
const dashboardRoutes = require('./dashboardRoute');







// authenticator
const {authenticate} = require('../middlewares/authMiddleware');
 

// authentication routes
router.use('/auth', authRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/about-app', aboutRoutes);
router.use('/terms-and-conditions', termsRoutes);
router.use('/privacy-policy', privacyRoutes);
router.use('/s3', authenticate,s3Routes);
router.use('/invitation',authenticate, invitationRoutes)
router.use("/profile", profileRoutes);
router.use('/user', authenticate, userRoutes);
router.use('/sports', sportRoutes);
router.use('/subscription', authenticate, subscriptionRoutes);
router.use('/notification', authenticate, notificationRoutes);
router.use('/posts', authenticate, postRoutes);
router.use('/comments', authenticate, commentRoutes);
router.use('/reactions', authenticate, reactionRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/football', footballRoutes);
// router.use('/nba', nbaRoutes);
router.use('/nfl', nflRoutes);
router.use('/admin',authenticate, adminVoteRoute);
router.use('/predictions', authenticate, predictionRoute);
router.use('/stripe', stripeRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);

module.exports = router;

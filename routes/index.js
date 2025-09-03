const express = require('express');
const router = express.Router();


// Import all modules
const authRoutes = require('./authRoute');
const s3Routes = require('./s3Route');
const invitationRoutes = require('./invitationRoute');
const profileRoutes = require("./profileRoute");
const userRoutes = require('./userRoute');
const cricketRoutes = require('./cricketRoute');
const sportRoutes = require('./sportRoute');
const subscriptionRoutes = require('./subscriptionRoute');
const notificationRoutes = require('./notificationRoute');







// authenticator
const {authenticate} = require('../middlewares/authMiddleware');
 

// authentication routes
router.use('/auth', authRoutes);
router.use('/s3', authenticate,s3Routes);
router.use('/invitation',authenticate, invitationRoutes)
router.use("/profile", profileRoutes);
router.use('/user', authenticate, userRoutes);
router.use('/cricket', authenticate, cricketRoutes);
router.use('/sports', sportRoutes);
router.use('/subscription', authenticate, subscriptionRoutes);
router.use('/notification', authenticate, notificationRoutes);


module.exports = router;

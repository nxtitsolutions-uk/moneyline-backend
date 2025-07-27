const express = require('express');
const router = express.Router();

// Import all modules
const authRoutes = require('./authRoute');
const s3Routes = require('./s3Route');
const invitationRoutes = require('./invitationRoute');
const profileRoutes = require("./profileRoute");







// authenticator
const {authenticate} = require('../middlewares/authMiddleware');
 

// authentication routes
router.use('/auth', authRoutes);
router.use('/s3', authenticate,s3Routes);
router.use('/invitation',authenticate, invitationRoutes)
router.use("/profile", authenticate, profileRoutes);



module.exports = router;

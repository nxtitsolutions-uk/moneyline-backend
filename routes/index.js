const express = require('express');
const router = express.Router();

// Import all modules
const authRoutes = require('./authRoute');
const s3Routes = require('./s3Route');
const invitationRoutes = require('./invitationRoute');







// authenticator
const authenticate = require('../middlewares/authMiddleware');
 

// authentication routes
router.use('/auth', authRoutes);
router.use('/s3', s3Routes);
router.use('/invitation',invitationRoutes)



module.exports = router;

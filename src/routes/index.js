const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const biodataRoutes = require('./biodata.routes');
const adminRoutes = require('./admin.routes');
const favouriteRoutes = require('./favourite.routes');
const paymentRoutes = require('./payment.routes');
const contactRequestRoutes = require('./contactRequest.routes');
const successStoryRoutes = require('./successStory.routes');

const router = express.Router();

router.use(authRoutes);
router.use(userRoutes);
router.use(biodataRoutes);
router.use(adminRoutes);
router.use(favouriteRoutes);
router.use(paymentRoutes);
router.use(contactRequestRoutes);
router.use(successStoryRoutes);

module.exports = router;

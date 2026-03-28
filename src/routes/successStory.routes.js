const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const { getStories, getStoriesAdmin, createStory } = require('../controllers/successStory.controller');

const router = express.Router();
router.get('/success-stories', asyncHandler(getStories));
router.get('/success-stories/admin', verifyToken, verifyAdmin, asyncHandler(getStoriesAdmin));
router.post('/success-stories', verifyToken, asyncHandler(createStory));
module.exports = router;

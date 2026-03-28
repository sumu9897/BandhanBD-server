const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const { getAllBiodatas, getPendingPremiumRequests, approvePremium, rejectPremium, getAdminStats, getAdminAnalytics } = require('../controllers/admin.controller');

const router = express.Router();
router.get('/admin/biodatas', verifyToken, verifyAdmin, asyncHandler(getAllBiodatas));
router.get('/admin/premium-requests', verifyToken, verifyAdmin, asyncHandler(getPendingPremiumRequests));
router.patch('/admin/biodatas/:id/approve-premium', verifyToken, verifyAdmin, asyncHandler(approvePremium));
router.patch('/admin/biodatas/:id/reject-premium', verifyToken, verifyAdmin, asyncHandler(rejectPremium));
router.get('/admin/stats', verifyToken, verifyAdmin, asyncHandler(getAdminStats));
router.get('/admin/analytics', verifyToken, verifyAdmin, asyncHandler(getAdminAnalytics));
module.exports = router;

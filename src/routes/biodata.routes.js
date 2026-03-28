const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  createBiodata,
  updateBiodata,
  getBiodatas,
  getPremiumBiodatas,
  getFeaturedBiodatas,
  getBiodataStats,
  getBiodataInsightsController,
  getOwnBiodata,
  getBiodataByEmail,
  getBiodataDetails,
  requestPremium,
} = require('../controllers/biodata.controller');

const router = express.Router();
router.post('/biodatas', verifyToken, asyncHandler(createBiodata));
router.put('/biodatas/:email', verifyToken, asyncHandler(updateBiodata));
router.get('/biodatas', asyncHandler(getBiodatas));
router.get('/biodatas/premium', asyncHandler(getPremiumBiodatas));
router.get('/biodatas/featured', asyncHandler(getFeaturedBiodatas));
router.get('/biodatas/stats', asyncHandler(getBiodataStats));
router.get('/biodatas/insights', asyncHandler(getBiodataInsightsController));
router.get('/biodatas/mine', verifyToken, asyncHandler(getOwnBiodata));
router.get('/biodatas/by-email/:email', verifyToken, asyncHandler(getBiodataByEmail));
router.get('/biodatas/:id', verifyToken, asyncHandler(getBiodataDetails));
router.post('/biodatas/premium-request', verifyToken, asyncHandler(requestPremium));
module.exports = router;

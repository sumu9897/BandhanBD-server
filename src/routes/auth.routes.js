const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { createJwtToken } = require('../controllers/auth.controller');

const router = express.Router();
router.post('/jwt', asyncHandler(createJwtToken));
module.exports = router;

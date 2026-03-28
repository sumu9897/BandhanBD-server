const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const { getOwnRequests, getAllRequests, createContactRequest, approveContactRequest, deleteContactRequest } = require('../controllers/contactRequest.controller');

const router = express.Router();
router.get('/contact-requests/mine', verifyToken, asyncHandler(getOwnRequests));
router.get('/contact-requests', verifyToken, verifyAdmin, asyncHandler(getAllRequests));
router.post('/contact-requests', verifyToken, asyncHandler(createContactRequest));
router.patch('/contact-requests/:id/approve', verifyToken, verifyAdmin, asyncHandler(approveContactRequest));
router.delete('/contact-requests/:id', verifyToken, asyncHandler(deleteContactRequest));
module.exports = router;

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const { getUsers, isAdmin, isPremium, createUser, makeAdmin, makePremium, removeUser } = require('../controllers/user.controller');

const router = express.Router();
router.get('/users', verifyToken, verifyAdmin, asyncHandler(getUsers));
router.get('/users/admin/:email', verifyToken, asyncHandler(isAdmin));
router.get('/users/premium/:email', verifyToken, asyncHandler(isPremium));
router.post('/users', asyncHandler(createUser));
router.patch('/users/admin/:id', verifyToken, verifyAdmin, asyncHandler(makeAdmin));
router.patch('/users/premium/:id', verifyToken, verifyAdmin, asyncHandler(makePremium));
router.delete('/users/:id', verifyToken, verifyAdmin, asyncHandler(removeUser));
module.exports = router;

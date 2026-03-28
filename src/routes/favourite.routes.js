const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../middlewares/auth.middleware');
const { getFavourites, checkFavourite, createFavourite, deleteFavourite } = require('../controllers/favourite.controller');

const router = express.Router();
router.get('/favourites', verifyToken, asyncHandler(getFavourites));
router.get('/favourites/check', verifyToken, asyncHandler(checkFavourite));
router.post('/favourites', verifyToken, asyncHandler(createFavourite));
router.delete('/favourites/:id', verifyToken, asyncHandler(deleteFavourite));
module.exports = router;

const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const getFavourites = async (req, res) => {
  const { favoritesCollection } = await getCollections();
  const result = await favoritesCollection.find({ email: req.decoded.email }).sort({ addedAt: -1 }).toArray();
  res.json(result);
};

const checkFavourite = async (req, res) => {
  const { favoritesCollection } = await getCollections();
  const { biodataMongoId } = req.query;
  if (!biodataMongoId || !ObjectId.isValid(biodataMongoId)) throw new AppError('Invalid biodata ID', 400);
  const existing = await favoritesCollection.findOne({ email: req.decoded.email, biodataMongoId: new ObjectId(biodataMongoId) });
  res.json({ isFavourite: !!existing });
};

const createFavourite = async (req, res) => {
  const { favoritesCollection, biodataCollection } = await getCollections();
  const { biodataMongoId } = req.body;
  if (!ObjectId.isValid(biodataMongoId)) throw new AppError('Invalid biodata ID', 400);
  const email = req.decoded.email;
  const existing = await favoritesCollection.findOne({ email, biodataMongoId: new ObjectId(biodataMongoId) });
  if (existing) throw new AppError('Already in your favourites', 400);
  const biodata = await biodataCollection.findOne({ _id: new ObjectId(biodataMongoId) });
  if (!biodata) throw new AppError('Biodata not found', 404);
  const result = await favoritesCollection.insertOne({
    email,
    biodataMongoId: new ObjectId(biodataMongoId),
    biodataId: biodata.biodataId,
    name: biodata.name,
    permanentDivision: biodata.permanentDivision,
    occupation: biodata.occupation,
    profileImage: biodata.profileImage,
    addedAt: new Date(),
  });
  res.status(201).json({ message: 'Added to favourites', result });
};

const deleteFavourite = async (req, res) => {
  const { favoritesCollection } = await getCollections();
  const result = await favoritesCollection.deleteOne({ _id: new ObjectId(req.params.id), email: req.decoded.email });
  if (result.deletedCount === 0) throw new AppError('Favourite not found', 404);
  res.json({ message: 'Favourite removed successfully' });
};

module.exports = { getFavourites, checkFavourite, createFavourite, deleteFavourite };

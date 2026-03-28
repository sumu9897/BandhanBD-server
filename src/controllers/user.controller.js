const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const getUsers = async (req, res) => {
  const { userCollection } = await getCollections();
  const search = req.query.search || '';
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const result = await userCollection.find(query).sort({ createdAt: -1 }).toArray();
  res.json(result);
};

const isAdmin = async (req, res) => {
  const { userCollection } = await getCollections();
  const email = req.params.email;
  if (email !== req.decoded.email) throw new AppError('Forbidden access', 403);
  const user = await userCollection.findOne({ email });
  res.json({ admin: user?.role === 'admin' });
};

const isPremium = async (req, res) => {
  const { userCollection } = await getCollections();
  const email = req.params.email;
  if (email !== req.decoded.email) throw new AppError('Forbidden access', 403);
  const user = await userCollection.findOne({ email });
  res.json({ isPremium: user?.role === 'premium' || user?.isPremium === true });
};

const createUser = async (req, res) => {
  const { userCollection } = await getCollections();
  const user = req.body;
  const existingUser = await userCollection.findOne({ email: user.email });
  if (existingUser) {
    return res.json({ message: 'User already exists', insertedId: null });
  }
  user.role = user.role || 'user';
  user.isPremium = false;
  user.createdAt = new Date();
  const result = await userCollection.insertOne(user);
  res.status(201).json(result);
};

const makeAdmin = async (req, res) => {
  const { userCollection } = await getCollections();
  const result = await userCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: 'admin' } },
  );
  res.json(result);
};

const makePremium = async (req, res) => {
  const { userCollection } = await getCollections();
  const result = await userCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: 'premium', isPremium: true } },
  );
  res.json(result);
};

const removeUser = async (req, res) => {
  const { userCollection } = await getCollections();
  const result = await userCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
};

module.exports = {
  getUsers,
  isAdmin,
  isPremium,
  createUser,
  makeAdmin,
  makePremium,
  removeUser,
};

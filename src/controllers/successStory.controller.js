const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const getStories = async (_req, res) => {
  const { successStoryCollection } = await getCollections();
  const stories = await successStoryCollection.find({}).sort({ marriageDate: -1 }).toArray();
  res.json(stories);
};

const getStoriesAdmin = async (_req, res) => {
  const { successStoryCollection } = await getCollections();
  const stories = await successStoryCollection.find({}).sort({ createdAt: -1 }).toArray();
  res.json(stories);
};

const createStory = async (req, res) => {
  const { successStoryCollection } = await getCollections();
  const { selfBiodataId, partnerBiodataId, coupleImage, successStory, marriageDate, reviewStar } = req.body;
  if (!selfBiodataId || !partnerBiodataId || !successStory || !marriageDate || !reviewStar) throw new AppError('All fields are required', 400);
  const star = parseInt(reviewStar, 10);
  if (star < 1 || star > 5) throw new AppError('Review star must be between 1 and 5', 400);
  const result = await successStoryCollection.insertOne({
    selfBiodataId: parseInt(selfBiodataId, 10),
    partnerBiodataId: parseInt(partnerBiodataId, 10),
    coupleImage: coupleImage || null,
    successStory,
    marriageDate: new Date(marriageDate),
    reviewStar: star,
    submitterEmail: req.decoded.email,
    createdAt: new Date(),
  });
  res.status(201).json({ message: 'Success story submitted!', storyId: result.insertedId });
};

module.exports = { getStories, getStoriesAdmin, createStory };

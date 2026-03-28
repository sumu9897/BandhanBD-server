const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');
const { buildBiodataQuery, getSortOption, enrichBiodata, getBiodataInsights } = require('../services/biodata.service');

const createBiodata = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const biodata = req.body;
  const existing = await biodataCollection.findOne({ email: biodata.email });
  if (existing) throw new AppError('Biodata already exists for this user. Use PUT to update.', 400);

  const lastBiodata = await biodataCollection.find().sort({ biodataId: -1 }).limit(1).toArray();
  const lastId = lastBiodata[0]?.biodataId || 0;

  const document = {
    ...biodata,
    biodataId: lastId + 1,
    isPremium: false,
    premiumStatus: 'none',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await biodataCollection.insertOne(document);
  res.status(201).json(result);
};

const updateBiodata = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const email = req.params.email;
  if (email !== req.decoded.email) throw new AppError('Forbidden access', 403);
  const update = { ...req.body };
  ['_id', 'biodataId', 'isPremium', 'premiumStatus'].forEach((field) => delete update[field]);
  update.updatedAt = new Date();
  const result = await biodataCollection.updateOne({ email }, { $set: update }, { upsert: false });
  res.json(result);
};

const getBiodatas = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const { page = 1, limit = 20, sortBy = 'latest' } = req.query;
  const query = buildBiodataQuery(req.query);
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [biodatas, total] = await Promise.all([
    biodataCollection.find(query).sort(getSortOption(sortBy)).skip(skip).limit(parseInt(limit, 10)).toArray(),
    biodataCollection.countDocuments(query),
  ]);

  res.json({
    biodatas: biodatas.map(enrichBiodata),
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages: Math.ceil(total / parseInt(limit, 10)),
  });
};

const getPremiumBiodatas = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const order = req.query.order === 'desc' ? -1 : 1;
  const premiumProfiles = await biodataCollection.find({ premiumStatus: 'approved' }).sort({ age: order }).limit(6).toArray();
  res.json(premiumProfiles.map(enrichBiodata));
};

const getFeaturedBiodatas = async (_req, res) => {
  const { biodataCollection } = await getCollections();
  const profiles = await biodataCollection.find({ premiumStatus: 'approved' }).sort({ updatedAt: -1, createdAt: -1 }).limit(4).toArray();
  res.json(profiles.map(enrichBiodata));
};

const getBiodataStats = async (_req, res) => {
  const { biodataCollection, successStoryCollection } = await getCollections();
  const [totalBiodata, maleBiodata, femaleBiodata, premiumBiodata, marriagesCompleted] = await Promise.all([
    biodataCollection.countDocuments(),
    biodataCollection.countDocuments({ biodataType: 'Male' }),
    biodataCollection.countDocuments({ biodataType: 'Female' }),
    biodataCollection.countDocuments({ premiumStatus: 'approved' }),
    successStoryCollection.countDocuments(),
  ]);
  res.json({ totalBiodata, maleBiodata, femaleBiodata, premiumBiodata, marriagesCompleted });
};

const getBiodataInsightsController = async (_req, res) => {
  const insights = await getBiodataInsights();
  res.json(insights);
};

const getOwnBiodata = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const biodata = await biodataCollection.findOne({ email: req.decoded.email });
  if (!biodata) throw new AppError('Biodata not found', 404);
  res.json(enrichBiodata(biodata));
};

const getBiodataByEmail = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const email = req.params.email;
  if (email !== req.decoded.email) throw new AppError('Forbidden access', 403);
  const biodata = await biodataCollection.findOne({ email });
  if (!biodata) throw new AppError('Biodata not found', 404);
  res.json(enrichBiodata(biodata));
};

const getBiodataDetails = async (req, res) => {
  const { biodataCollection, userCollection, contactRequestCollection } = await getCollections();
  const biodata = await biodataCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!biodata) throw new AppError('Biodata not found', 404);

  const requesterEmail = req.decoded.email;
  const requesterUser = await userCollection.findOne({ email: requesterEmail });
  const isPremium = requesterUser?.role === 'premium' || requesterUser?.isPremium === true;
  const approvedRequest = await contactRequestCollection.findOne({ requesterEmail, biodataId: biodata.biodataId, status: 'approved' });

  const response = { ...biodata };
  if (!isPremium && !approvedRequest) {
    delete response.contactEmail;
    delete response.mobileNumber;
  }

  res.json(enrichBiodata(response));
};

const requestPremium = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const biodata = await biodataCollection.findOne({ email: req.decoded.email });
  if (!biodata) throw new AppError('Biodata not found', 404);
  if (biodata.premiumStatus === 'approved') throw new AppError('Already a premium member', 400);
  if (biodata.premiumStatus === 'pending') throw new AppError('Premium request already pending', 400);
  await biodataCollection.updateOne({ email: req.decoded.email }, { $set: { premiumStatus: 'pending', premiumRequestDate: new Date() } });
  res.json({ success: true, message: 'Premium request sent. Awaiting admin approval.' });
};

module.exports = {
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
};

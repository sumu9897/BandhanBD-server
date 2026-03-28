const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const getAllBiodatas = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [biodatas, total] = await Promise.all([
    biodataCollection.find({}).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).toArray(),
    biodataCollection.countDocuments(),
  ]);
  res.json({ biodatas, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
};

const getPendingPremiumRequests = async (_req, res) => {
  const { biodataCollection } = await getCollections();
  const pendingRequests = await biodataCollection.find({ premiumStatus: 'pending' }).sort({ premiumRequestDate: -1 }).toArray();
  res.json(pendingRequests);
};

const approvePremium = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const result = await biodataCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { premiumStatus: 'approved', isPremium: true, premiumApprovedDate: new Date() } },
  );
  if (result.modifiedCount === 0) throw new AppError('Biodata not found or already approved', 404);
  res.json({ success: true, message: 'Premium request approved' });
};

const rejectPremium = async (req, res) => {
  const { biodataCollection } = await getCollections();
  const result = await biodataCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { premiumStatus: 'rejected' } },
  );
  if (result.modifiedCount === 0) throw new AppError('Biodata not found', 404);
  res.json({ success: true, message: 'Premium request rejected' });
};

const getAdminStats = async (_req, res) => {
  const { biodataCollection, paymentCollection } = await getCollections();
  const [biodataCount, maleCount, femaleCount, premiumCount, revenueResult] = await Promise.all([
    biodataCollection.estimatedDocumentCount(),
    biodataCollection.countDocuments({ biodataType: 'Male' }),
    biodataCollection.countDocuments({ biodataType: 'Female' }),
    biodataCollection.countDocuments({ premiumStatus: 'approved' }),
    paymentCollection.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$amount' } } }]).toArray(),
  ]);
  const revenue = revenueResult[0]?.totalRevenue || 0;
  res.json({ biodataCount, maleCount, femaleCount, premiumCount, revenue });
};

const getAdminAnalytics = async (_req, res) => {
  const { userCollection, biodataCollection, paymentCollection, contactRequestCollection } = await getCollections();
  const [divisionBreakdown, monthlyUsers, monthlyBiodatas, recentPayments, recentRequests] = await Promise.all([
    biodataCollection.aggregate([
      { $group: { _id: '$permanentDivision', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]).toArray(),
    userCollection.aggregate([
      { $match: { createdAt: { $exists: true } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]).toArray(),
    biodataCollection.aggregate([
      { $match: { createdAt: { $exists: true } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]).toArray(),
    paymentCollection.find({}).sort({ createdAt: -1 }).limit(5).project({ email: 1, amount: 1, createdAt: 1, transactionId: 1, _id: 0 }).toArray(),
    contactRequestCollection.find({}).sort({ createdAt: -1 }).limit(5).project({ requesterEmail: 1, biodataId: 1, status: 1, createdAt: 1, _id: 0 }).toArray(),
  ]);

  res.json({
    divisionBreakdown: divisionBreakdown.map((item) => ({ name: item._id || 'Unknown', total: item.total })),
    monthlyUsers: monthlyUsers.map((item) => ({ month: item._id, total: item.total })),
    monthlyBiodatas: monthlyBiodatas.map((item) => ({ month: item._id, total: item.total })),
    recentPayments,
    recentRequests,
  });
};

module.exports = {
  getAllBiodatas,
  getPendingPremiumRequests,
  approvePremium,
  rejectPremium,
  getAdminStats,
  getAdminAnalytics,
};

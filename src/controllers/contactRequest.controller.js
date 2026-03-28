const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const getOwnRequests = async (req, res) => {
  const { contactRequestCollection } = await getCollections();
  const result = await contactRequestCollection.find({ requesterEmail: req.decoded.email }).sort({ createdAt: -1 }).toArray();
  res.json(result);
};

const getAllRequests = async (_req, res) => {
  const { contactRequestCollection } = await getCollections();
  const result = await contactRequestCollection.find().sort({ createdAt: -1 }).toArray();
  res.json(result);
};

const createContactRequest = async (req, res) => {
  const { contactRequestCollection, biodataCollection } = await getCollections();
  const { biodataId, stripePaymentId } = req.body;
  if (!biodataId) throw new AppError('biodataId is required', 400);
  const requesterEmail = req.decoded.email;
  const existing = await contactRequestCollection.findOne({ requesterEmail, biodataId: parseInt(biodataId, 10) });
  if (existing) throw new AppError('Contact request already exists for this biodata', 400);
  const biodata = await biodataCollection.findOne({ biodataId: parseInt(biodataId, 10) });
  if (!biodata) throw new AppError('Biodata not found', 404);
  const result = await contactRequestCollection.insertOne({
    biodataId: parseInt(biodataId, 10),
    biodataName: biodata.name,
    requesterEmail,
    status: 'pending',
    stripePaymentId: stripePaymentId || null,
    amountPaid: 5,
    createdAt: new Date(),
  });
  res.status(201).json(result);
};

const approveContactRequest = async (req, res) => {
  const { contactRequestCollection } = await getCollections();
  const result = await contactRequestCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: 'approved', approvedAt: new Date() } });
  if (result.modifiedCount === 0) throw new AppError('Request not found or already approved', 404);
  res.json({ success: true, message: 'Contact request approved' });
};

const deleteContactRequest = async (req, res) => {
  const { contactRequestCollection } = await getCollections();
  const result = await contactRequestCollection.deleteOne({ _id: new ObjectId(req.params.id), requesterEmail: req.decoded.email });
  if (result.deletedCount === 0) throw new AppError('Request not found', 404);
  res.json({ message: 'Contact request deleted' });
};

module.exports = { getOwnRequests, getAllRequests, createContactRequest, approveContactRequest, deleteContactRequest };

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const createPaymentIntent = async (_req, res) => {
  const amount = 500;
  const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'usd', payment_method_types: ['card'] });
  res.json({ clientSecret: paymentIntent.client_secret });
};

const createPayment = async (req, res) => {
  const { paymentCollection } = await getCollections();
  const payment = req.body;
  if (payment.email !== req.decoded.email) throw new AppError('Forbidden access', 403);
  const result = await paymentCollection.insertOne({ ...payment, amount: 5, createdAt: new Date() });
  res.status(201).json(result);
};

const getPayments = async (_req, res) => {
  const { paymentCollection } = await getCollections();
  const result = await paymentCollection.find().sort({ createdAt: -1 }).toArray();
  res.json(result);
};

const getPaymentsByEmail = async (req, res) => {
  const { paymentCollection } = await getCollections();
  if (req.params.email !== req.decoded.email) throw new AppError('Forbidden access', 403);
  const result = await paymentCollection.find({ email: req.params.email }).sort({ createdAt: -1 }).toArray();
  res.json(result);
};

module.exports = { createPaymentIntent, createPayment, getPayments, getPaymentsByEmail };

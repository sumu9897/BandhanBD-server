const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { getCollections } = require('../config/collections');
const AppError = require('../utils/appError');

const verifyToken = (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return next(new AppError('Unauthorized access', 401));
  }

  const token = authorization.split(' ')[1];
  jwt.verify(token, env.jwtSecret, (err, decoded) => {
    if (err) {
      return next(new AppError('Unauthorized access', 401));
    }
    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, _res, next) => {
  const { userCollection } = await getCollections();
  const email = req.decoded?.email;
  const user = await userCollection.findOne({ email });
  if (user?.role !== 'admin') {
    return next(new AppError('Forbidden access', 403));
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };

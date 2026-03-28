const { ObjectId } = require('mongodb');
const AppError = require('./appError');

const ensureObjectId = (value, label = 'ID') => {
  if (!ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return new ObjectId(value);
};

const ensureRequiredFields = (payload, fields) => {
  for (const field of fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new AppError(`${field} is required`, 400);
    }
  }
};

module.exports = { ensureObjectId, ensureRequiredFields };

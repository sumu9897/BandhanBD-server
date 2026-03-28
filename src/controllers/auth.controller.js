const jwt = require('jsonwebtoken');
const env = require('../config/env');

const createJwtToken = async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, env.jwtSecret, { expiresIn: '7d' });
  res.json({ token });
};

module.exports = { createJwtToken };

const env = {
  port: process.env.PORT || 5500,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.ACCESS_TOKEN_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME || 'bondhanbd',
};

module.exports = env;

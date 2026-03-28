require('dotenv').config();
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`BandhanBD Server running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

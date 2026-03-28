const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://bandhanbd.web.app', env.clientUrl].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'BandhanBD API is running',
    status: 'ok',
    architecture: 'MVC',
    features: ['advanced-biodata-filtering', 'featured-profiles', 'admin-analytics'],
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

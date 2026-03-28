const { MongoClient, ServerApiVersion } = require('mongodb');
const env = require('./env');

const uri = `mongodb+srv://${env.dbUser}:${env.dbPass}@cluster0.rmec6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

const connectDB = async () => {
  if (!database) {
    await client.connect();
    database = client.db(env.dbName);
    console.log(`MongoDB connected to database: ${env.dbName}`);
  }
  return database;
};

const getDB = async () => {
  if (!database) {
    return connectDB();
  }
  return database;
};

module.exports = { connectDB, getDB, client };

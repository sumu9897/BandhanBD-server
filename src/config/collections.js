const { getDB } = require('./db');

const getCollections = async () => {
  const db = await getDB();
  return {
    userCollection: db.collection('users'),
    biodataCollection: db.collection('biodatas'),
    favoritesCollection: db.collection('favorites'),
    paymentCollection: db.collection('payments'),
    contactRequestCollection: db.collection('contactRequests'),
    successStoryCollection: db.collection('successStories'),
  };
};

module.exports = { getCollections };

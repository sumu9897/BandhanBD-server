const { getCollections } = require('../config/collections');
const divisions = require('../constants/divisions');

const buildBiodataQuery = (queryParams = {}) => {
  const {
    ageMin = 18,
    ageMax = 100,
    biodataType,
    division,
    premiumOnly,
    keyword,
  } = queryParams;

  const query = {
    age: { $gte: parseInt(ageMin, 10), $lte: parseInt(ageMax, 10) },
  };

  if (biodataType) query.biodataType = biodataType;
  if (division) query.permanentDivision = division;
  if (premiumOnly === 'true') query.premiumStatus = 'approved';
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { occupation: { $regex: keyword, $options: 'i' } },
      { permanentDivision: { $regex: keyword, $options: 'i' } },
      { presentAddress: { $regex: keyword, $options: 'i' } },
      { expectedPartnerOccupation: { $regex: keyword, $options: 'i' } },
    ];
  }

  return query;
};

const getSortOption = (sortBy = 'latest') => {
  const map = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    ageAsc: { age: 1 },
    ageDesc: { age: -1 },
    nameAsc: { name: 1 },
  };
  return map[sortBy] || map.latest;
};

const calculateProfileCompletion = (biodata = {}) => {
  const fields = [
    'name', 'profileImage', 'biodataType', 'dateOfBirth', 'age', 'height', 'weight',
    'occupation', 'race', 'fatherName', 'motherName', 'permanentDivision',
    'presentAddress', 'expectedPartnerAge', 'expectedPartnerHeight',
    'expectedPartnerWeight', 'contactEmail', 'mobileNumber'
  ];

  const completed = fields.filter((field) => {
    const value = biodata[field];
    return value !== undefined && value !== null && String(value).trim() !== '';
  }).length;

  return Math.round((completed / fields.length) * 100);
};

const enrichBiodata = (biodata) => ({
  ...biodata,
  profileCompletion: calculateProfileCompletion(biodata),
});

const getBiodataInsights = async () => {
  const { biodataCollection } = await getCollections();
  const [divisionCounts, occupationSamples] = await Promise.all([
    biodataCollection.aggregate([
      { $group: { _id: '$permanentDivision', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]).toArray(),
    biodataCollection.aggregate([
      { $match: { occupation: { $exists: true, $ne: '' } } },
      { $group: { _id: '$occupation', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]).toArray(),
  ]);

  return {
    divisions: divisions.map((division) => ({
      division,
      total: divisionCounts.find((item) => item._id === division)?.total || 0,
    })),
    topOccupations: occupationSamples.map((item) => ({ label: item._id, total: item.total })),
    sortOptions: [
      { value: 'latest', label: 'Newest first' },
      { value: 'oldest', label: 'Oldest first' },
      { value: 'ageAsc', label: 'Age: Low to high' },
      { value: 'ageDesc', label: 'Age: High to low' },
      { value: 'nameAsc', label: 'Name: A to Z' },
    ],
  };
};

module.exports = {
  buildBiodataQuery,
  getSortOption,
  calculateProfileCompletion,
  enrichBiodata,
  getBiodataInsights,
};

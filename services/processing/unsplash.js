const request = require('request-promise-native');

const getImage = async (query) => {
  const { UNSPLASH_TOKEN } = process.env;
  const params = {
    client_id: UNSPLASH_TOKEN,
    page: 1,
    orientation: 'landscape',
    query,
  };
  const options = {
    uri: 'https://api.unsplash.com/search/photos',
    qs: params,
    json: true,
  };
  const res = await request(options);
  const index = Math.floor(Math.random() * (res.results.length - 1));
  return res.results[index].urls.regular;
};

module.exports = {
  getImage,
};

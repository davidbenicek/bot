const request = require('request-promise-native');

const callAPI = async (endpoint, params) => {
  const { SKYSCANNER_TOKEN } = process.env;
  if (!params) {
    params = {};
  }
  params.apikey = SKYSCANNER_TOKEN;
  const options = {
    uri: `http://partners.api.skyscanner.net/apiservices/${endpoint}`,
    qs: params,
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,
  };
  return request(options);
};

const formatInfo = async (routes, places, currency) => {
  const placesLookUp = {};
  places.forEach((place) => {
    placesLookUp[place.PlaceId] = {
      name: place.Name,
      type: place.Type,
      code: place.SkyscannerCode,
    };
  });
  routes = routes.sort((a, b) => (
    a.Price > b.Price
  )).slice(0, 10);
  let offers = routes.map(route => (
    {
      origin: placesLookUp[route.OriginId],
      destination: placesLookUp[route.DestinationId],
      currency,
      price: route.Price,
    }
  ));
  offers = offers.sort((a, b) => (
    a.price > b.price
  )).slice(0, 10);
  return offers;
};

const findFlight = async (
  originAirport,
  destinationAirport,
  outboundDate,
  returnDate,
  country,
  currency,
  locale) => {
  if (!originAirport) throw new Error('Origin aiport undefined. Required in findFlight');
  if (!destinationAirport) destinationAirport = 'anywhere';
  if (!outboundDate) outboundDate = 'anytime';
  if (!returnDate) returnDate = 'anytime';
  if (!country) country = 'UK';
  if (!currency) currency = 'GBP';
  if (!locale) locale = 'en-UK';
  console.log(`browseroutes/v1.0/${country}/${currency}/${locale}/${originAirport}/${destinationAirport}/${outboundDate}/${returnDate}`);

  let res = await callAPI(`browseroutes/v1.0/${country}/${currency}/${locale}/${originAirport}/${destinationAirport}/${outboundDate}/${returnDate}`);
  console.log(Object.keys(res));
  console.log("Got it", res.Routes[0]);
  const options = await formatInfo(res.Routes, res.Places, res.Currencies[0]);
  console.log(options);
  return options;
};

module.exports = {
  findFlight,
};

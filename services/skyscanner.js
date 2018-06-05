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

const getLocationCode = async (query, country, currency, locale) => {
  if (!country) country = 'UK';
  if (!currency) currency = 'GBP';
  if (!locale) locale = 'en-UK';

  const locations = await callAPI('autosuggest/v1.0/UK/GBP/en-GB/', { query });
  return locations.Places[0];
};

const formatInfo = async (routes, places, currency, length) => {
  if (!routes || !places || !currency) throw new Error('You must specify routes, places and a currency for formatInfo');
  const placesLookUp = {};
  places.forEach((place) => {
    placesLookUp[place.PlaceId] = {
      name: place.Name,
      type: place.Type,
      code: place.SkyscannerCode,
    };
  });

  if (!length) length = 10;
  routes = routes.sort((a, b) => (
    a.Price < b.Price
  )).slice(routes.length - length);

  let offers = routes.map(route => ({
    origin: placesLookUp[route.OriginId],
    destination: placesLookUp[route.DestinationId],
    currency,
    price: route.Price,
  }));
  offers = offers.sort((a, b) => (
    parseInt(a.price, 10) < parseInt(b.price, 10)
  ));
  return offers.slice(0, 10);
};

const browseRoutes = async (
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

  const res = await callAPI(`browseroutes/v1.0/${country}/${currency}/${locale}/${originAirport}/${destinationAirport}/${outboundDate}/${returnDate}`);
  console.log(Object.keys(res));
  console.log("Got it", res.Routes[0]);
  const options = await formatInfo(res.Routes, res.Places, res.Currencies[0]);
  console.log(options);
  return options;
};

const browseQuotes = async (
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
  console.log(`browsequotes/v1.0/${country}/${currency}/${locale}/${originAirport}/${destinationAirport}/${outboundDate}/${returnDate}`);

  const res = await callAPI(`browsequotes/v1.0/${country}/${currency}/${locale}/${originAirport}/${destinationAirport}/${outboundDate}/${returnDate}`);
  console.log('Got it!', Object.keys(res));
  // console.log("Got it", res.Quotes[0]);
  // const options = await formatInfo(res.Routes, res.Places, res.Currencies[0]);
  // console.log(options);
  return res;
};

module.exports = {
  browseRoutes,
  browseQuotes,
  getLocationCode,
};

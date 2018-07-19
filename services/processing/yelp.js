const request = require('request-promise-native');
const builder = require('botbuilder');

const { BASE_URL } = process.env;

const callAPI = (category, location) => {
  const { YELP_TOKEN } = process.env;
  if (!category) {
    category = '';
  }
  if (!location) {
    location = '';
  }
  const options = {
    uri: `https://api.yelp.com/v3/businesses/search?term=${category}&location=${location}&sortby=rating&limit=9`,
    headers: {
      Authorization: `Bearer ${YELP_TOKEN}`,
    },
    json: true,
  };
  return request(options);
};

const formatYelpToCards = (session, results) => new Promise((resolve) => {
  const cards = [];
  const promises = results.map(async (yelp) => {
    cards.push(new builder.HeroCard(session)
      .title(yelp.name)
      .subtitle(`${yelp.location.address1}, ${yelp.location.zip_code}, ${yelp.location.city}`)
      .text(`Price: ${yelp.price}, Rating: ${yelp.rating}`)
      .images([
        builder.CardImage.create(session, yelp.image_url),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `${BASE_URL}/redirect?category=bookAccommodation&label=listing&url=${yelp.url}`, 'Go to listing'),
      ]));
    return Promise.resolve();
  });
  Promise.all(promises).then(() => {
    cards.push(new builder.HeroCard(session)
      .title('Find more great places on Yelp')
      .text('Search for hotels, restaurants etc.')
      .images([
        builder.CardImage.create(session, 'https://s3-media1.fl.yelpcdn.com/assets/srv0/styleguide/891ac3707136/assets/img/brand_guidelines/yelp_fullcolor@2x.png'),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `${BASE_URL}/redirect?category=bookAccommodation&label=yelp&url=https://www.yelp.com`, 'More on Yelp'),
      ]));
    resolve(cards);
  });
});

module.exports = {
  callAPI,
  formatYelpToCards,
};

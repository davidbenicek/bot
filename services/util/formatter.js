const builder = require('botbuilder');

const unsplash = require('../unsplash');

const ensureDateIsNotPast = (inputDates, boundaryDate) => {
  if (!inputDates) throw new Error('Must specify array of at least one input date');

  const dateToBeat = (!boundaryDate) ? new Date() : new Date(boundaryDate);
  const dates = inputDates.filter(date => new Date(date.value) > dateToBeat);

  return dates;
};

const formatRoutesIntoCards = async (session, flights) => new Promise(async (resolve) => {
  if (!session) throw new Error('Must specify a session for building cards in formatRoutesIntoCards');
  if (!flights) throw new Error('Must specify an array for flight for formatRoutesIntoCards');
  const flightsOverview = [];
  const promises = flights.reverse().map(async (flight) => {
    const image = await unsplash.getImage(flight.destination.name);
    flightsOverview.push(new builder.HeroCard(session)
      .title(flight.destination.name)
      .subtitle(`How do you fancy a trip to  ${flight.destination.name}?`)
      .text(`Fly from ${flight.origin.name} to ${flight.destination.name} for ${flight.currency.Symbol}${flight.price}!`)
      .images([
        builder.CardImage.create(session, image),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `https://www.skyscanner.net/transport/flights/${flight.origin.code}/${flight.destination.code}/`, 'Book!'),
      ]));
    return Promise.resolve();
  });
  Promise.all(promises).then(() => {
    flightsOverview.push(new builder.HeroCard(session)
      .title('Book more trips with Skyscanner')
      .subtitle('The worlds travel engine')
      .text('There are plenty other great deals for flights, hotels, car hire and rail on the Skyscanner website')
      .images([
        builder.CardImage.create(session, 'https://palife.co.uk/wp-content/uploads/2017/08/skyscanner.jpg'),
      ])
      .buttons([
        builder.CardAction.openUrl(session, 'https://www.skyscanner.net', 'Go to Skyscanner'),
      ]));
    resolve(flightsOverview);
  });
});

const formatQuotesIntoCards = (session, flights) => new Promise(async (resolve) => {
  if (!session) throw new Error('Must specify a session for building cards in formatQuotesIntoCards');
  if (!flights) throw new Error('Must specify an array for flight for formatQuotesIntoCards');
  const flightsOverview = [];
  const image = await unsplash.getImage(flights[0].outbound.destination.name);
  const promises = flights.reverse().map((flight, i) => {
    flightsOverview.push(new builder.HeroCard(session)
      .title(`Option #${i + 1}: for ${flight.currency.Symbol}${flight.price}`)
      .subtitle(`Flying out with ${flight.outbound.carrier.name} ${(flight.inbound) ? `and back with ${flight.inbound.carrier.name}` : ''}`)
      .text(`Fly from ${flight.outbound.origin.name} to ${flight.outbound.destination.name} ${(flight.inbound) ? `and back from ${flight.inbound.origin.name} to  ${flight.inbound.destination.name}` : ''}`)
      .images([
        builder.CardImage.create(session, image),
      ])
      .buttons([
        builder.CardAction.openUrl(session, 'https://www.skyscanner.net/', 'Book!'),
      ]));
    return Promise.resolve();
  });
  Promise.all(promises).then(() => {
    flightsOverview.push(new builder.HeroCard(session)
      .title('Book more trips with Skyscanner')
      .subtitle('The worlds travel engine')
      .text('There are plenty other great deals for flights, hotels, car hire and rail on the Skyscanner website')
      .images([
        builder.CardImage.create(session, 'https://palife.co.uk/wp-content/uploads/2017/08/skyscanner.jpg'),
      ])
      .buttons([
        builder.CardAction.openUrl(session, 'https://www.skyscanner.net', 'Go to Skyscanner'),
      ]));
    resolve(flightsOverview);
  });
});

module.exports = {
  ensureDateIsNotPast,
  formatRoutesIntoCards,
  formatQuotesIntoCards,
};

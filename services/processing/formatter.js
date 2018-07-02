const builder = require('botbuilder');
const moment = require('moment');

const unsplash = require('./unsplash');

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
      .text(`Fly from ${flight.origin.name} to ${flight.destination.name} starting at ${flight.currency.Symbol}${flight.price}!`)
      .images([
        builder.CardImage.create(session, image),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `https://www.skyscanner.net/transport/flights/${flight.origin.code}/${flight.destination.code}/`, 'Go to Skyscanner'),
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
        builder.CardAction.openUrl(session, 'https://www.skyscanner.net', 'More on Skyscanner'),
      ]));
    resolve(flightsOverview);
  });
});

const formatQuotesIntoCards = (session, flights) => new Promise(async (resolve) => {
  if (!session) throw new Error('Must specify a session for building cards in formatQuotesIntoCards');
  if (!flights) throw new Error('Must specify an array for flight for formatQuotesIntoCards');
  const flightsOverview = [];
  const promises = flights.reverse().map(async (flight) => {
    const image = await unsplash.getImage(session.dialogData.trip.destination);
    const outboundDate = (!flight.outbound || !flight.outbound.date) ? '' : moment(flight.outbound.date).format('YYMMDD');
    const inboundDate = (!flight.inbound || !flight.inbound.date) ? '' : moment(flight.inbound.date).format('YYMMDD');
    flightsOverview.push(new builder.HeroCard(session)
      .title(`To ${session.dialogData.trip.destination} starting at ${flight.currency.Symbol}${flight.price} ${(flight.direct ? '' : '(INDIRECT)')}`)
      .subtitle(`Flying out with ${flight.outbound.carrier.name} ${(flight.inbound) ? `and back with ${flight.inbound.carrier.name}` : ''} ${(flight.direct ? '' : ' with a layover')}`)
      .text(`Fly from ${flight.outbound.origin.name} to ${flight.outbound.destination.name} ${(flight.inbound) ? `and back from ${flight.inbound.origin.name} to  ${flight.inbound.destination.name}` : ''}`)
      .images([
        builder.CardImage.create(session, image),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `http://skyscanner.net/transport/flights/${flight.outbound.origin.code}/${flight.outbound.destination.code}/${outboundDate}/${inboundDate}`, 'Go to Skyscanner'),
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
        builder.CardAction.openUrl(session, 'https://www.skyscanner.net', 'More on Skyscanner'),
      ]));
    resolve(flightsOverview);
  });
});

module.exports = {
  ensureDateIsNotPast,
  formatRoutesIntoCards,
  formatQuotesIntoCards,
};

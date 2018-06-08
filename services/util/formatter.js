const builder = require('botbuilder');

const ensureDateIsNotPast = (inputDates, boundaryDate) => {
  if (!inputDates) throw new Error('Must specify array of at least one input date');

  const dateToBeat = (!boundaryDate) ? new Date() : new Date(boundaryDate);
  const dates = inputDates.filter(date => new Date(date.value) > dateToBeat);

  return dates;
};

const formatRoutesIntoCards = (session, flights) => {
  const flightsOverview = [];
  flights.reverse().forEach((flight) => {
    flightsOverview.push(new builder.HeroCard(session)
      .title(flight.destination.name)
      .subtitle(`How do you fancy a trip to  ${flight.destination.name}?`)
      .text(`Fly from ${flight.origin.name} to ${flight.destination.name} for ${flight.currency.Symbol}${flight.price}!`)
      .images([
        builder.CardImage.create(session, 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg'),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `https://www.skyscanner.net/transport/flights/${flight.origin.code}/${flight.destination.code}/`, 'Book!'),
      ]));
  });

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
  return flightsOverview;
};

const formatQuotesIntoCards = (session, flights) => {
  const flightsOverview = [];
  flights.reverse().forEach((flight, i) => {
    flightsOverview.push(new builder.HeroCard(session)
      .title(`Option #${i + 1}: for ${flight.currency.Symbol}${flight.price}`)
      .subtitle(`Flying out with ${flight.outbound.carrier.name} ${(flight.inbound) ? `and back with ${flight.inbound.carrier.name}` : ''}`)
      .text(`Fly from ${flight.outbound.origin.name} to ${flight.outbound.destination.name} ${(flight.inbound) ? `and back from ${flight.inbound.origin.name} to  ${flight.inbound.destination.name}` : ''}`)
      .images([
        builder.CardImage.create(session, 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg'),
      ])
      .buttons([
        builder.CardAction.openUrl(session, 'https://www.skyscanner.net/', 'Book!'),
      ]));
  });
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
  return flightsOverview;
};

module.exports = {
  ensureDateIsNotPast,
  formatRoutesIntoCards,
  formatQuotesIntoCards,
};

const builder = require('botbuilder');
const ua = require('universal-analytics');

const visitor = ua('UA-100450115-2');

const formatter = require('../processing/formatter');
const skyscanner = require('../processing/skyscanner');
const strings = require('./strings');
const LATEST = require('./data/latest');

const promptOrigin = (session, reply, next) => {
  visitor.pageview('bookFlight');
  console.log('---> Prompt origin');
  console.log(reply);
  session.sendTyping();
  // Try get all the data from the initial user query
  const origin = builder.EntityRecognizer.findEntity(reply.entities, 'place::origin');
  const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');
  let [date1, date2] = builder.EntityRecognizer.findAllEntities(reply.entities, 'builtin.datetimeV2.date');

  if (date1) [date1] = formatter.ensureDateIsNotPast(date1.resolution.values);
  if (date2) [date2] = formatter.ensureDateIsNotPast(date2.resolution.values, date1.value);

  // Save to dialog data
  const trip = {
    origin: origin ? origin.entity : undefined,
    destination: destination ? destination.entity : undefined,
    date1,
    date2,
  };
  session.dialogData.trip = trip;


  // If there's no from param, ask!
  if (!trip.origin) {
    visitor.event('bookFlights', 'origin', 'missing').send();
    builder.Prompts.text(session, strings.get('flights', 'originPrompt', 'eng')); // TODO: Add send location button
  } else {
    visitor.event('bookFlights', 'origin', 'provided').send();
    next();
  }
};

const promptDestination = async (session, reply, next) => {
  console.log('---> Prompt destination');
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    visitor.event('bookFlights', 'origin', 'elicited').send();
    session.dialogData.trip.origin = reply.response;
  }

  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.destination) {
    try {
      visitor.event('bookFlights', 'destination', 'missing').send();
      builder.Prompts.text(session, strings.get('flights', 'destinationPrompt', 'eng')); // TODO: Add anywhere button
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
    }
  } else {
    visitor.event('bookFlights', 'destination', 'provided').send();
    next();
  }
};

const promptFlexible = async (session, reply, next) => {
  console.log('---> Prompt flexible');
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    console.log(reply.response, typeof reply.response);
    if (typeof reply.response === 'string') {
      visitor.event('bookFlights', 'destination', 'elicited').send();
      session.dialogData.trip.destination = reply.response;
    } else {
      visitor.event('bookFlights', 'destination', 'elicited').send();
      console.log('here');
      session.dialogData.trip.destination = reply.response.entity;
    }
  }
  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.date1 && !trip.date2) {
    try {
      visitor.event('bookFlights', 'dates', 'missing', 'both').send();
      builder.Prompts.choice(session, strings.get('flights', 'flexiblePrompt', 'eng'), ['Flexible', 'Specify Dates'], { listStyle: builder.ListStyle.button });
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
    }
  } else {
    visitor.event('bookFlights', 'dates', 'provided', 'both').send();
    next();
  }
};

const promptOutbound = async (session, reply, next) => {
  console.log('---> Prompt outbound');
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    const response = (typeof reply.response === 'string') ? reply.response : reply.response.entity;
    if (response.toLowerCase() === 'flexible') {
      visitor.event('bookFlights', 'dates', 'elicited', 'flexible').send();
      session.dialogData.trip.date1 = 'anytime';
      session.dialogData.trip.date2 = 'anytime';
    }
  }
  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.date1) {
    try {
      builder.Prompts.text(session, strings.get('flights', 'outboundPrompt', 'eng'));
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
    }
  } else {
    next();
  }
};

const promptReturn = async (session, reply, next) => {
  console.log('---> Prompt return');
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    if (reply.response.toLowerCase() === 'anytime') {
      visitor.event('bookFlights', 'dates', 'elicited').send();
      session.dialogData.trip.date1 = 'anytime';
    } else {
      const tempDate = builder.EntityRecognizer.recognizeTime(
        reply.response,
        new Date(),
      ).resolution.start;
      session.dialogData.trip.date1 = tempDate.toISOString().slice(0, 10);
      visitor.event('bookFlights', 'dates', 'elicited').send();
    }
  }

  const { trip } = session.dialogData;
  // If there's no from param, ask!
  if (!trip.date2) {
    try {
      if (trip.date1 === 'anytime') {
        builder.Prompts.choice(session, strings.get('flights', 'returningPrompt', 'eng'), ['anytime', 'one way'], { listStyle: builder.ListStyle.button });
      } else {
        builder.Prompts.text(session, strings.get('flights', 'returningPromptNonFlexible', 'eng'));
      }
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
    }
  } else {
    next();
  }
};

const processRequest = async (session, reply, next) => {
  console.log('---> Process flight request');
  session.sendTyping();
  if (reply.response) {
    const response = (typeof reply.response === 'string') ? reply.response : reply.response.entity;
    if (response.toLowerCase() === 'one way') {
      visitor.event('bookFlights', 'dates', 'elicited').send();
      session.dialogData.trip.date2 = '';
    } else if (response.toLowerCase() === 'anytime') {
      visitor.event('bookFlights', 'dates', 'elicited').send();
      session.dialogData.trip.date2 = 'anytime';
    } else {
      const tempDate = builder.EntityRecognizer.recognizeTime(
        response,
        new Date(),
      ).resolution.start;
      session.dialogData.trip.date2 = tempDate.toISOString().slice(0, 10);
      visitor.event('bookFlights', 'dates', 'elicited').send();
    }
  }

  const { trip } = session.dialogData;
  if (!trip.destination || trip.destination.toLowerCase() === 'anywhere') {
    try {
      const fromSkyscannerCode = await skyscanner.getLocationCode(trip.origin);
      const flights = await skyscanner.browseRoutes(fromSkyscannerCode.PlaceId);
      const flightsOverview = await formatter.formatRoutesIntoCards(session, flights);
      const message = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(flightsOverview);

      session.send(message);
      setTimeout(next, 5000);
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
    }
  } else {
    try {
      const fromSkyscannerCode = await skyscanner.getLocationCode(trip.origin);
      const toSkyscannerCode = await skyscanner.getLocationCode(trip.destination);
      const date1 = (typeof trip.date1 !== 'string' && 'value' in trip.date1) ? trip.date1.value : trip.date1;
      const date2 = (typeof trip.date2 !== 'string' && 'value' in trip.date2) ? trip.date2.value : trip.date2;
      const flights = await skyscanner.browseQuotes(
        fromSkyscannerCode.PlaceId,
        toSkyscannerCode.PlaceId,
        date1,
        date2,
      );
      if (flights.length !== 0) {
        const flightsOverview = await formatter.formatQuotesIntoCards(session, flights);

        const message = new builder.Message(session)
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(flightsOverview);

        session.send(message);
        setTimeout(next, 5000);
      } else {
        session.send(strings.get('flights', 'noResults', 'eng'));
      }
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
      // TODO: This needs to be handeled better
    }
  }
};

const upsell = (session) => {
  console.log('---> Prompt origin');
  // Save completed session info for follow up
  LATEST.destination = session.dialogData.trip.destination;
  LATEST.address = session.message.address;
  LATEST.prompt = strings.get('flights', 'followUp', 'eng');

  if (session.dialogData.trip.destination.toLowerCase() !== 'anywhere') {
    session.send(strings.get('flights', 'react', 'eng'), session.dialogData.trip.destination);
  }
  const msg = new builder.Message(session)
    .text(strings.get('upsell', 'prompt', 'eng'))
    .suggestedActions(builder.SuggestedActions.create(session, [
      builder.CardAction.imBack(session, 'Book accommodation', '🏠 Book accommodation!'),
      builder.CardAction.imBack(session, 'Tell me about things to do', '📍 Find things to do'),
      builder.CardAction.imBack(session, 'Send me visa information', '🛂 Check your visa info'),
    ]));
  session.send(msg);
};


module.exports = {
  promptOrigin,
  promptDestination,
  promptFlexible,
  promptOutbound,
  promptReturn,
  processRequest,
  upsell,
};


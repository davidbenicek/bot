const builder = require('botbuilder');

const yelp = require('../processing/yelp');
const strings = require('./strings');
const LATEST = require('./data/latest');

const promptType = (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  // Try get all the data from the initial user query
  const type = builder.EntityRecognizer.findEntity(reply.entities, 'accommodationType');
  const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');
  if (destination) {
    session.dialogData.trip = {
      type: type ? type.entity : undefined,
      destination: destination.entity,
    };
  } else if (session.dialogData.trip) {
    session.dialogData.trip.type = type ? type.entity : undefined;
  } else {
    session.dialogData.trip = {
      type: type ? type.entity : undefined,
    };
  }
  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.type) {
    builder.Prompts.choice(session, strings.get('accommodation', 'stylePrompt', 'eng'), ['Hotel', 'Hostel'], { listStyle: builder.ListStyle.button });
  } else {
    next();
  }
};

const promptDestination = async (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    const response = (typeof reply.response === 'string') ? reply.response : reply.response.entity;
    session.dialogData.trip.type = response;
  }
  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.destination || trip.destination.toLowerCase() === 'anywhere') {
    try {
      builder.Prompts.text(session, strings.get('accommodation', 'destinationPrompt', 'eng'));
    } catch (err) {
      console.log(err);
      session.send(strings.get('error', 'error', 'eng'));
    }
  } else {
    next();
  }
};

const processRequest = async (session, reply, next) => {
  session.sendTyping();
  if (reply.response) {
    session.dialogData.trip.destination = reply.response;
  }

  const { trip } = session.dialogData;
  try {
    const x = await yelp.callAPI(trip.type, trip.destination);
    const cards = await yelp.formatYelpToCards(session, x.businesses);
    const hotels = new builder.Message(session)
      .attachmentLayout(builder.AttachmentLayout.carousel)
      .attachments(cards);

    session.send(hotels);
    setTimeout(next, 5000);
  } catch (err) {
    console.log(err);
    session.send(strings.get('error', 'error', 'eng'));
    // TODO: This needs to be handeled better
  }
};

const upsell = (session) => {
  // Save completed session info for follow up
  LATEST.destination = session.dialogData.trip.destination;
  LATEST.address = session.message.address;
  LATEST.prompt = strings.get('accommodation', 'followUp', 'eng');

  session.send(strings.get('accommodation', 'react', 'eng'));
  const msg = new builder.Message(session)
    .text(strings.get('upsell', 'prompt', 'eng'))
    .suggestedActions(builder.SuggestedActions.create(session, [
      builder.CardAction.imBack(session, 'Book me a flight', '✈️ Book a flight'),
      builder.CardAction.imBack(session, 'Tell me about things to do', '📍 Find things to do'),
      builder.CardAction.imBack(session, 'Send me visa information', '🛂 Check your visa info'),
    ]));
  session.send(msg);
};

module.exports = {
  promptType,
  promptDestination,
  processRequest,
  upsell,
};


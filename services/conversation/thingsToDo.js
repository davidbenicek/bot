const builder = require('botbuilder');
const ua = require('universal-analytics');

const visitor = ua('UA-100450115-2');

const unsplash = require('../processing/unsplash');
const strings = require('./strings');
const LATEST = require('./data/latest');

const { BASE_URL } = process.env;

const promptDestination = (session, reply, next) => {
  visitor.pageview('thingsToDo');
  console.log(reply);
  session.sendTyping();
  // Try get all the data from the initial user query
  const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');
  if (destination) {
    // Save to dialog data
    const trip = {
      destination: destination.entity,
    };
    session.dialogData.trip = trip;
  }

  // If there's no from param, ask!
  if (!session.dialogData.trip || !session.dialogData.trip.destination || session.dialogData.trip.destination === 'anywhere') {
    visitor.event('thingsToDo', 'destination', 'missing').send();
    builder.Prompts.text(session, strings.get('thingsToDo', 'destinationPrompt', 'eng')); // TODO: Add send location button
  } else {
    visitor.event('thingsToDo', 'destination', 'provided').send();
    next();
  }
};

const processRequest = async (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    session.dialogData.trip.destination = reply.response;
    visitor.event('thingsToDo', 'destination', 'elicited').send();
  }
  try {
    const image = await unsplash.getImage(session.dialogData.trip.destination);
    const card = [new builder.HeroCard(session)
      .title(`Things to do in ${session.dialogData.trip.destination}`)
      .subtitle('Provided by WikiTravel')
      .text(`We've put together some great tips for you in ${session.dialogData.trip.destination}`)
      .images([
        builder.CardImage.create(
          session,
          image,
        ),
      ])
      .buttons([
        builder.CardAction.openUrl(session, `${BASE_URL}/redirect?category=thingsToDo&label=info&url=https://wikitravel.org/en/${session.dialogData.trip.destination}#See`, 'Go to WikiTravel'),
      ])];
    const message = new builder.Message(session)
      .attachmentLayout(builder.AttachmentLayout.list)
      .attachments(card);
    session.send(message);
    setTimeout(next, 5000);
  } catch (err) {
    console.log(err);
    strings.get('error', 'error', 'eng');
  }
};

const upsell = (session) => {
  // Save completed session info for follow up
  LATEST.destination = session.dialogData.trip.destination;
  LATEST.address = session.message.address;
  LATEST.prompt = strings.get('thingsToDo', 'followUp', 'eng');

  session.send(strings.get('thingsToDo', 'react', 'eng'));
  const msg = new builder.Message(session)
    .text(strings.get('upsell', 'prompt', 'eng'))
    .suggestedActions(builder.SuggestedActions.create(session, [
      builder.CardAction.imBack(session, 'Book me a flight', '✈️ Book that flight'),
      builder.CardAction.imBack(session, 'Book accommodation', '🏠 Book accommodation!'),
      builder.CardAction.imBack(session, 'Send me visa information', '🛂 Check your visa info'),
    ]));
  session.send(msg);
};

module.exports = {
  promptDestination,
  processRequest,
  upsell,
};


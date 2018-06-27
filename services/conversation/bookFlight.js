const builder = require('botbuilder');

const formatter = require('../processing/formatter');
const skyscanner = require('../processing/skyscanner');


const promptOrigin = (session, reply, next) => {
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
    builder.Prompts.text(session, 'Where would you like to fly from?'); // TODO: Add send location button
  } else {
    next();
  }
};

const promptDestination = async (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    session.dialogData.trip.origin = reply.response;
  }

  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.destination) {
    try {
      builder.Prompts.text(session, 'Where would you like to fly to? (anywhere is an option, by the way)'); // TODO: Add anywhere button
    } catch (err) {
      console.log(err);
    }
  } else {
    next();
  }
};

const promptOutbound = async (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    session.dialogData.trip.destination = reply.response;
  }
  const { trip } = session.dialogData;

  // If there's no from param, ask!
  if (!trip.date1) {
    try {
      builder.Prompts.text(session, 'What date would you like to fly out on? (anytime is an option)'); // TODO: Add anytime button
    } catch (err) {
      console.log(err);
    }
  } else {
    next();
  }
};

const promptReturn = async (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    if (reply.response.toLowerCase() === 'anytime') {
      session.dialogData.trip.date1 = 'anytime';
    } else {
      const tempDate = builder.EntityRecognizer.recognizeTime(
        reply.response,
        new Date(),
      ).resolution.start;
      session.dialogData.trip.date1 = tempDate.toISOString().slice(0, 10);
    }
  }

  const { trip } = session.dialogData;
  // If there's no from param, ask!
  if (!trip.date2) {
    try {
      if (trip.date1 === 'anytime') {
        builder.Prompts.choice(session, 'When are you returning?', ['anytime', 'one way'], { listStyle: builder.ListStyle.button });
      } else {
        builder.Prompts.text(session, 'What date would you like to fly back on? (one way is a valid option)'); // TODO: Add one way button
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    next();
  }
};

const processRequest = async (session, reply, next) => {
  session.sendTyping();
  if (reply.response) {
    const response = (typeof reply.response === 'string') ? reply.response : reply.response.entity;
    if (response.toLowerCase() === 'one way') {
      session.dialogData.trip.date2 = '';
    } else if (response.toLowerCase() === 'anytime') {
      session.dialogData.trip.date2 = 'anytime';
    } else {
      const tempDate = builder.EntityRecognizer.recognizeTime(
        response,
        new Date(),
      ).resolution.start;
      session.dialogData.trip.date2 = tempDate.toISOString().slice(0, 10);
    }
  }

  const { trip } = session.dialogData;
  // If there's no from param, ask!
  // session.send('I have failed. I am not strong enough. Please try again!');

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
      session.send('I am so sorry, I goofed up. Try again plase!');
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

      const flightsOverview = await formatter.formatQuotesIntoCards(session, flights);

      const message = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(flightsOverview);

      session.send(message);
      setTimeout(next, 5000);
    } catch (err) {
      console.log(err);
      session.send('Something has wrong. Please try again!');
      session.send(err.message); // TODO: This needs to be handeled better
    }
  }
};

const upsell = (session) => {
  if (session.dialogData.trip.destination.toLowerCase() !== 'anywhere') {
    session.send(`Ah, you're going to ${session.dialogData.trip.destination}?! I'm so jelous 😣`);
  }
  const msg = new builder.Message(session)
    .text('What`s next? 🤔')
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
  promptOutbound,
  promptReturn,
  processRequest,
  upsell,
};


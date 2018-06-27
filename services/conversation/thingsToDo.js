const builder = require('botbuilder');

const unsplash = require('../processing/unsplash');

const promptDestination = (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  // Try get all the data from the initial user query
  const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');
  if (destination) {
    // Save to dialog data
    const trip = {
      destination: destination ? destination.entity : undefined,
    };
    session.dialogData.trip = trip;
  }

  // If there's no from param, ask!
  if (!session.dialogData.trip.destination || session.dialogData.trip.destination === 'anywhere') {
    builder.Prompts.text(session, 'Which city are you interested in?'); // TODO: Add send location button
  } else {
    next();
  }
};

const processRequest = async (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  if (reply.response) {
    session.dialogData.trip.destination = reply.response;
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
        builder.CardAction.openUrl(session, `https://wikitravel.org/en/${session.dialogData.trip.destination}#See`, 'Go to WikiTravel'),
      ])];
    const message = new builder.Message(session)
      .attachmentLayout(builder.AttachmentLayout.list)
      .attachments(card);
    session.send(message);
    setTimeout(next, 5000);
  } catch (err) {
    console.log(err);
    session.send('I have failed. I am not strong enough. Please try again!');
  }
};

const upsell = (session) => {
  session.send('Woah, I bet you can\'t wait to explore those! 🔍👀');
  const msg = new builder.Message(session)
    .text('🙋 Have you got everything sorted?')
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


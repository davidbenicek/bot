const builder = require('botbuilder');

const yelp = require('../processing/yelp');

const promptType = (session, reply, next) => {
  console.log(reply);
  session.sendTyping();
  // Try get all the data from the initial user query
  const type = builder.EntityRecognizer.findEntity(reply.entities, 'accommodationType');
  const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');


  // Save to dialog data
  const trip = {
    type: type ? type.entity : undefined,
    destination: destination ? destination.entity : undefined,
  };
  session.dialogData.trip = trip;


  // If there's no from param, ask!
  if (!trip.type) {
    builder.Prompts.choice(session, 'What style of accomodation do you prefer?', ['Hotel', 'Hostel'], { listStyle: builder.ListStyle.button });
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
  if (!trip.destination) {
    try {
      builder.Prompts.text(session, 'What city are you looking to stay in?');
    } catch (err) {
      console.log(err);
    }
  } else {
    next();
  }
};

const processRequest = async (session, reply) => {
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
  } catch (err) {
    console.log(err);
    session.send('Something has wrong. Please try again!');
    session.send(err.message); // TODO: This needs to be handeled better
  }
};


module.exports = {
  promptType,
  promptDestination,
  processRequest,
};


const restify = require('restify');
const builder = require('botbuilder');
require('dotenv').load();

const secretsManager = require('./util/secretsManager');
const formatter = require('./util/formatter');
const skyscanner = require('./services/skyscanner');
// const botbuilderAzure = require("botbuilder-azure");
const server = restify.createServer();
server.listen(process.env.PORT || 3978, () => {
  console.log(`Listening on port ${process.env.PORT || 3978}`);
});

server.get('/', (req, res, cb) => {
  res.send('Something, something Turing test...');
  return cb();
});

const setUp = () => {
  const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
    openIdMetadata: process.env.BotOpenIdMetadata,
  });

  // Listen for messages from users
  server.post('/api/messages', connector.listen());

  /*----------------------------------------------------------------------------------------
  * Bot Storage: This is a great spot to register the private state storage for your bot. 
  * We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
  * For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
  * ---------------------------------------------------------------------------------------- */

  // var tableName = 'botdata';
  // var azureTableClient = new botbuilderAzure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
  // var tableStorage = new botbuilderAzure.AzureBotStorage({ gzipData: false }, azureTableClient);

  // Create your bot with a function to receive messages from the user
  const bot = new builder.UniversalBot(connector);
  // bot.set('storage', tableStorage);

  // Make sure you add code to validate these fields
  const { LUIS_APP_ID } = process.env;
  const { LUIS_APP_KEY } = process.env;
  const LUIS_API_HOSTNAME = process.env.LUIS_API_HOSTNAME || 'westus.api.cognitive.microsoft.com';

  const LUIS_URL = `https://${LUIS_API_HOSTNAME}/luis/v2.0/apps/${LUIS_APP_ID}?subscription-key=${LUIS_APP_KEY}&verbose=true&timezoneOffset=0&q=`

  const recognizer = new builder.LuisRecognizer(LUIS_URL);
  const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
      session.send('Hey there! How can I help?');
    })
    .matches('Book.Flight', [(session, reply, next) => {
      console.log(reply);
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
        builder.Prompts.text(session, 'Where would you like to fly from?');
      } else {
        next();
      }
    }, async (session, reply, next) => {
      if (reply.response) {
        session.dialogData.trip.origin = reply.response;
      }

      const { trip } = session.dialogData;

      // If there's no from param, ask!
      if (!trip.destination) {
        try {
          builder.Prompts.text(session, 'Where would you like to fly to? (anywhere is an option, by the way)');
        } catch (err) {
          console.log(err);
        }
      } else {
        next();
      }
    }, async (session, reply) => {
      console.log("REPLY");
      console.log(reply);
      if (reply.response) {
        session.dialogData.trip.destination = reply.response;
      }
      const { trip } = session.dialogData;

      if (trip.destination.toLowerCase() === 'anywhere' || trip.destination === '') {
        try {
          const fromSkyscannerCode = await skyscanner.getLocationCode(trip.origin);
          console.log(fromSkyscannerCode);
          const flights = await skyscanner.browseRoutes(fromSkyscannerCode.PlaceId);
          console.log("FLIGHTS!:", flights);
          // flights.reverse().forEach((flight) => {
          //   flightsOverview += `From ${flight.origin.name} to ${flight.destination.name} for ${flight.currency.Symbol}${flight.price}!\n\n\n\n`;
          // });
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
                builder.CardAction.openUrl(session, 'https://www.skyscanner.net', 'Book!'),
              ]));
          });

          const message = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(flightsOverview);

          session.send(message);
        } catch (err) {
          console.log(err);
          session.send('I am so sorry, I goofed up. Try again plase!');
        }
      } else {
        try {
          const fromSkyscannerCode = await skyscanner.getLocationCode(trip.origin);
          const toSkyscannerCode = await skyscanner.getLocationCode(trip.destination);
          console.log(fromSkyscannerCode, toSkyscannerCode);
          const flights = await skyscanner.browseQuotes(fromSkyscannerCode.PlaceId, toSkyscannerCode.PlaceId, trip.date1.value, trip.date2.value);
          console.log("FLIGHTS!:", flights);
          session.send(`I found ${flights.Quotes.length} flights! Will be sending you details soon - one of them costs ${flights.Quotes[0].MinPrice}`);
        } catch (err) {
          console.log(err.message);
          session.send('I have failed. I am not strong enough. Please try again!');
        }
      }
    }])
    .onDefault((session) => {
      session.send('Sorry pal, I did not understand \'%s\'.', session.message.text);
    });

  bot.dialog('/', intents);
};

if (process.env.BotEnv !== 'prod') {
  console.log('Running in local mode... keys are already set!');
  setUp();
} else {
  console.log('Running in production...');
  console.log('Fetching keys...');
  const keysReady = secretsManager.loadSecrets();
  keysReady.then((keys) => {
    process.env = keys;
    console.log('Keys retrieved...');
    setUp();
  }).catch((err) => {
    console.log('Failed to fetch keys...', err);
  });
}


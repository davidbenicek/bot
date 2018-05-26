const restify = require('restify');
const builder = require('botbuilder');
require('dotenv').load();

const secretsManager = require('./util/secretsManager');

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
    .matches('Flight.Book', [(session, reply, next) => {
      // Try get all the data from the initial user query
      const origin = builder.EntityRecognizer.findEntity(reply.entities, 'place::origin');
      const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');

      // Save to dialog data
      const trip = {
        origin: origin ? origin.entity : undefined,
        destination: destination ? destination.entity : undefined,
      };
      session.dialogData.trip = trip;


      // If there's no from param, ask!
      if (!trip.origin) {
        builder.Prompts.text(session, 'Where would you like to fly from?');
      } else {
        next();
      }
    }, (session, reply, next) => {
      if (reply.response) {
        session.dialogData.trip.origin = reply.response;
      }

      const { trip } = session.dialogData;

      // If there's no from param, ask!
      if (!trip.destination) {
        builder.Prompts.text(session, 'Where are you flying to?');
      } else {
        next();
      }
    }, (session, reply) => {
      if (reply.response) {
        session.dialogData.trip.destination = reply.response;
      }

      const { trip } = session.dialogData;

      session.send(`Booking flight from ${trip.origin} to ${trip.destination}`);
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


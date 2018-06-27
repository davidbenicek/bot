const restify = require('restify');
const builder = require('botbuilder');
require('dotenv').load();

const secretsManager = require('./services/processing/secretsManager');

const bookFlight = require('./services/conversation/bookFlight');
const bookAccommodation = require('./services/conversation/bookAccommodation');
const thingsToDo = require('./services/conversation/thingsToDo');
const visa = require('./services/conversation/visa');
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
  // var azureTableClient =
  // new botbuilderAzure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
  // var tableStorage = new botbuilderAzure.AzureBotStorage({ gzipData: false }, azureTableClient);

  // Create your bot with a function to receive messages from the user
  const bot = new builder.UniversalBot(connector);
  // bot.set('storage', tableStorage);

  // Make sure you add code to validate these fields
  const { LUIS_APP_ID } = process.env;
  const { LUIS_APP_KEY } = process.env;
  const LUIS_API_HOSTNAME = process.env.LUIS_API_HOSTNAME || 'westus.api.cognitive.microsoft.com';

  const LUIS_URL = `https://${LUIS_API_HOSTNAME}/luis/v2.0/apps/${LUIS_APP_ID}?subscription-key=${LUIS_APP_KEY}&verbose=true&timezoneOffset=0&q=`;

  const recognizer = new builder.LuisRecognizer(LUIS_URL);
  const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
      session.send('Hey there! How can I help?');
      const msg = new builder.Message(session)
        .text('Some of the things you could do are:')
        .suggestedActions(builder.SuggestedActions.create(session, [
          builder.CardAction.imBack(session, 'Book me a flight', '✈️ Book a flight'),
          builder.CardAction.imBack(session, 'Book accommodation', '🏠 Book accommodation'),
          builder.CardAction.imBack(session, 'Tell me about things to do', '📍 Things to do'),
          builder.CardAction.imBack(session, 'Send me visa information', '🛂 Visa info'),
        ]));
      session.send(msg);
    })
    .matches('Book.Flight', [
      bookFlight.promptOrigin,
      bookFlight.promptDestination,
      bookFlight.promptOutbound,
      bookFlight.promptReturn,
      bookFlight.processRequest,
    ])
    .matches('Book.Accommodation', [
      bookAccommodation.promptType,
      bookAccommodation.promptDestination,
      bookAccommodation.processRequest,
    ])
    .matches('Info.Location', [
      thingsToDo.promptDestination,
      thingsToDo.processRequest,
    ])
    .matches('Info.Visa', [
      visa.promptsNationality,
      visa.processNationality,
    ])
    .onDefault((session) => {
      if (session.message.value && session.message.value.type === 'visaCountrySelect') {
        visa.processRequest(session);
      } else {
        session.send('Sorry buddy, I did not understand \'%s\'...', session.message.text);
        session.send('At least you don\'t have to be worried about robots taking over soon!');
      }
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


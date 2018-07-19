const restify = require('restify');
const builder = require('botbuilder');
const ua = require('universal-analytics');

const visitor = ua('UA-100450115-2');

require('dotenv').load();

const secretsManager = require('./services/processing/secretsManager');
const bookFlight = require('./services/conversation/bookFlight');
const bookAccommodation = require('./services/conversation/bookAccommodation');
const thingsToDo = require('./services/conversation/thingsToDo');
const visa = require('./services/conversation/visa');
const pleasantries = require('./services/conversation/pleasantries');
const LATEST = require('./services/conversation/data/latest');

// const botbuilderAzure = require("botbuilder-azure");
const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.listen(process.env.PORT || 3978, () => {
  console.log(`Listening on port ${process.env.PORT || 3978}`);
});


server.get('/', restify.plugins.serveStatic({
  directory: './public',
  default: 'index.html',
}));

server.get('/css/', restify.plugins.serveStatic({
  directory: './public',
  default: 'index.css',
}));

server.get('/media/', restify.plugins.serveStatic({
  directory: './public',
  default: 'logo_narrow.png',
}));

server.get('/js/', restify.plugins.serveStatic({
  directory: './public',
  default: 'index.js',
}));

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
    .matches('Greeting', [pleasantries.hello])
    .matches('Goodbye', [pleasantries.goodbye])
    .matches('Thanks', [pleasantries.thanks])
    .matches('Joke', [pleasantries.joke])
    .matches('Book.Flight', [
      bookFlight.promptOrigin,
      bookFlight.promptDestination,
      bookFlight.promptFlexible,
      bookFlight.promptOutbound,
      bookFlight.promptReturn,
      bookFlight.processRequest,
      bookFlight.upsell,
    ])
    .matches('Book.Accommodation', [
      bookAccommodation.promptType,
      bookAccommodation.promptDestination,
      bookAccommodation.processRequest,
      bookAccommodation.upsell,
    ])
    .matches('Info.Location', [
      thingsToDo.promptDestination,
      thingsToDo.processRequest,
      thingsToDo.upsell,
    ])
    .matches('Info.Visa', [
      visa.promptsNationality,
      visa.processNationality,
      visa.upsell,
    ])
    .onDefault((session) => {
      if (session.message.value && session.message.value.type === 'visaCountrySelect') {
        visa.processRequest(session);
      } else {
        pleasantries.misunderstanding(session);
      }
    });

  bot.dialog('/', intents);

  bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
      message.membersAdded.forEach((identity) => {
        if (identity.id !== message.address.bot.id) {
          pleasantries.welcome(bot, message.address);
        }
      });
    }
  });

  bot.on('contactRelationUpdate', (message) => {
    if (message.message === 'add') {
      pleasantries.welcome(bot, message.address);
    }
  });

  server.get('/prompt', (req, res, cb) => {
    visitor.event('conversation', 'prompt').send();
    res.send(LATEST.prompt);
    bot.send(new builder.Message()
      .address(LATEST.address)
      .text(LATEST.prompt, LATEST.destination));
    return cb();
  });
};

server.get('/redirect', (req, res, cb) => {
  const {
    category,
    label,
    url,
  } = req.query;

  visitor.event(category, 'clickout', label).send();
  res.redirect(url, cb);
});

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


'use strict';

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
// var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
// bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = '<<PUT A URL HERE>>'

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
.matches('Greeting', (session) => {
    session.send('You reached Greeting intent, you said \'%s\'.', session.message.text);
})
.matches('Help', [(session) => {
    session.send('You reached Help intent, you said \'%s\'.', session.message.text);
}])
.matches('Flight.Book', [(session,reply,next) => {
    //Try get all the data from the initial user query
    const origin = builder.EntityRecognizer.findEntity(reply.entities, 'place::origin');
    const destination = builder.EntityRecognizer.findEntity(reply.entities, 'place::destination');    
    
    //Save to dialog data
    const trip = session.dialogData.trip = {
        origin : origin ? origin.entity : undefined,
        destination : destination ? destination.entity : undefined
    }


    //If there's no from param, ask!
    if (!trip.origin) {
        builder.Prompts.text(session, 'Where would you like to fly from?');
    } else {
        next();
    }
}, (session,reply,next) => {
    if(reply.response)
        session.dialogData.trip.origin = reply.response;
    
    const trip = session.dialogData.trip;


    //If there's no from param, ask!
    if (!trip.destination) {
        builder.Prompts.text(session, 'Where are you flying to?');
    } else {
        next();
    }
    
}, (session,reply) => {
    if(reply.response)
        session.dialogData.trip.destination =  reply.response;

    const trip = session.dialogData.trip;

    session.send(`Booking flight from ${ trip.origin} to ${ trip.destination}`);

}])
.onDefault((session) => {
    session.send('Hey, sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

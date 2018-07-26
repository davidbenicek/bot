const builder = require('botbuilder');
const FuzzySearch = require('fuzzy-search');
const ua = require('universal-analytics');

const visitor = ua('UA-100450115-2');

const VISA_COUNTRIES = require('./data/eng/nationalities');
const strings = require('./strings');

const { BASE_URL } = process.env;

const promptsNationality = (session) => {
  visitor.pageview('visa');
  if (session.message.address.channelId !== 'emulator' && session.message.address.channelId !== 'webchat') {
    visitor.event('visa', 'dropdown').send();
    builder.Prompts.text(session, strings.get('visa', 'countryPrompt', 'eng'));
  } else {
    visitor.event('visa', 'fuzzy').send();
    const choices = VISA_COUNTRIES.map(choice => ({
      title: choice,
      value: choice.replace(' ', '_'),
    }));

    const mesasge = {
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard',
        version: '1.0',
        body: [
          {
            type: 'Input.ChoiceSet',
            id: 'visaCountrySelect',
            style: 'compact',
            choices,
          },
        ],
        actions: [
          {
            type: 'Action.Submit',
            title: 'Find visa requirements',
            data: {
              type: 'visaCountrySelect',
            },
          },
        ],
      },
    };

    const visaMsg = new builder.Message(session).addAttachment(mesasge);
    session.send(strings.get('visa', 'countrySelect', 'eng'));
    session.send(visaMsg);
  }
};

const upsell = (session) => {
  session.send(strings.get('visa', 'react', 'eng'));
  const msg = new builder.Message(session)
    .text(strings.get('upsell', 'prompt', 'eng'))
    .suggestedActions(builder.SuggestedActions.create(session, [
      builder.CardAction.imBack(session, 'Book me a flight', '✈️ Book flight'),
      builder.CardAction.imBack(session, 'Book accommodation', '🏠 Book accommodation!'),
      builder.CardAction.imBack(session, 'Tell me about things to do', '📍 Find things to do'),
    ]));
  session.send(msg);
};

const processRequest = (session, visa) => {
  const visaInfoCard = [new builder.HeroCard(session)
    .title('Here\'s all your visa information')
    .subtitle('Provided by WikiTravel')
    .text('Please always check with your embassy or consulate for the most up to date informaiton')
    .images([
      builder.CardImage.create(session, 'https://www.esquireme.com/sites/default/files/styles/full_img/public/images/2016/08/11/passports-more-e1435313737544.jpg?itok=ueeDCMri'),
    ])
    .buttons([
      builder.CardAction.openUrl(session, `${BASE_URL}/redirect?category=visa&label=info&url=https://en.wikipedia.org/wiki/Visa_requirements_for_${visa || session.message.value.visaCountrySelect}#Visa_requirements`, 'Your Visa Requirements'),
    ])];
  const message = new builder.Message(session)
    .attachmentLayout(builder.AttachmentLayout.carousel)
    .attachments(visaInfoCard);

  session.send(message);
  setTimeout(() => { upsell(session); }, 5000);
};

const processNationality = (session, reply) => {
  console.log(reply);
  const searcher = new FuzzySearch(VISA_COUNTRIES, [], {
    sort: true,
  });
  const result = searcher.search(reply.response);// TODO:ask which is best - not always 0th
  session.send(strings.get('visa', 'countryConfirm', 'eng'), result[0]);
  processRequest(session, result[0]);
};

module.exports = {
  promptsNationality,
  processNationality,
  processRequest,
};

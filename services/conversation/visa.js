const builder = require('botbuilder');
const FuzzySearch = require('fuzzy-search');

const VISA_COUNTRIES = ['Abkhaz citizens',
  'Afghan citizens',
  'Albanian citizens',
  'Algerian citizens',
  'Andorran citizens',
  'Angolan citizens',
  'Antigua and Barbuda citizens',
  'Argentine citizens',
  'Armenian citizens',
  'Australian citizens',
  'Austrian citizens',
  'Azerbaijani citizens',
  'Bahamian citizens',
  'Bahraini citizens',
  'Bangladeshi citizens',
  'Barbadian citizens',
  'Belarusian citizens',
  'Belgian citizens',
  'Belizean citizens',
  'Beninese citizens',
  'Bhutanese citizens',
  'Bolivian citizens',
  'Bosnia and Herzegovina citizens',
  'Botswana citizens',
  'Brazilian citizens',
  'British citizens',
  'British Nationals (Overseas)',
  'British Overseas citizens',
  'British Overseas Territories citizens',
  'Bruneian citizens',
  'Bulgarian citizens',
  'Burkinabe citizens',
  'Burundian citizens',
  'Cambodian citizens',
  'Cameroonian citizens',
  'Canadian citizens',
  'Cape Verdean citizens',
  'Central African Republic citizens',
  'Chadian citizens',
  'Chilean citizens',
  'Chinese citizens',
  'Chinese citizens of Hong Kong',
  'Colombian citizens',
  'Comorian citizens',
  'Democratic Republic of the Congo citizens',
  'Republic of the Congo citizens',
  'Costa Rican citizens',
  'Croatian citizens',
  'Cuban citizens',
  'Cypriot citizens',
  'Czech citizens',
  'Danish citizens',
  'Djiboutian citizens',
  'Dominica citizens',
  'Dominican Republic citizens',
  'Dutch citizens',
  'East Timorese citizens',
  'Ecuadorian citizens',
  'Egyptian citizens',
  'El Salvador citizens',
  'Equatorial Guinean citizens',
  'Eritrean citizens',
  'Estonian citizens',
  'Ethiopian citizens',
  'European Union citizens',
  'Fijian citizens',
  'Finnish citizens',
  'French citizens',
  'Gabonese citizens',
  'Gambian citizens',
  'Georgian citizens',
  'German citizens',
  'Ghanaian citizens',
  'Greek citizens',
  'Grenadian citizens',
  'Guatemalan citizens',
  'Guinean citizens',
  'Guinea-Bissauan citizens',
  'Guyanese citizens',
  'Haitian citizens',
  'Honduran citizens',
  'Hungarian citizens',
  'Icelandic citizens',
  'Indian citizens',
  'Indonesian citizens',
  'Iranian citizens',
  'Iraqi citizens',
  'Irish citizens',
  'Israeli citizens',
  'Italian citizens',
  'Ivorian citizens',
  'Jamaican citizens',
  'Japanese citizens',
  'Jordanian citizens',
  'Kazakhstani citizens',
  'Kenyan citizens',
  'Kiribati citizens',
  'North Korean citizens',
  'South Korean citizens',
  'Kuwaiti citizens',
  'Kyrgyzstani citizens',
  'Laotian citizens',
  'Latvian citizens',
  'Lebanese citizens',
  'Lesotho citizens',
  'Liberian citizens',
  'Libyan citizens',
  'Liechtenstein citizens',
  'Lithuanian citizens',
  'Luxembourgish citizens',
  'Chinese citizens of Macau',
  'Macedonian citizens',
  'Malagasy citizens',
  'Malawian citizens',
  'Malaysian citizens',
  'Maldivian citizens',
  'Malian citizens',
  'Maltese citizens',
  'Marshall Islands citizens',
  'Mauritanian citizens',
  'Mauritian citizens',
  'Mexican citizens',
  'Micronesian citizens',
  'Moldovan citizens',
  'Monégasque citizens',
  'Mongolian citizens',
  'Montenegrin citizens',
  'Moroccan citizens',
  'Mozambican citizens',
  'Myanmar citizens',
  'Artsakh citizens',
  'Namibian citizens',
  'Nauruan citizens',
  'Nepalese citizens',
  'New Zealand citizens',
  'Nicaraguan citizens',
  'Nigerien citizens',
  'Nigerian citizens',
  'Northern Cypriot citizens',
  'Omani citizens',
  'Pakistani citizens',
  'Palauan citizens',
  'Palestinian citizens',
  'Panamanian citizens',
  'Papua New Guinean citizens',
  'Paraguayan citizens',
  'Peruvian citizens',
  'Philippine citizens',
  'Polish citizens',
  'Portuguese citizens',
  'Qatari citizens',
  'Romanian citizens',
  'Russian citizens',
  'Rwandan citizens',
  'Saint Kitts and Nevis citizens',
  'Saint Lucian citizens',
  'Saint Vincent and the Grenadines citizens',
  'Samoan citizens',
  'Sammarinese citizens',
  'Santomean citizens',
  'Saudi citizens',
  'Senegalese citizens',
  'Serbian citizens',
  'Seychellois citizens',
  'Singaporean citizens',
  'Slovak citizens',
  'Slovenian citizens',
  'Solomon Islands citizens',
  'Somaliland citizens',
  'South African citizens',
  'South Ossetia citizens',
  'South Sudanese citizens',
  'Spanish citizens',
  'Sri Lankan citizens',
  'Sudanese citizens',
  'Surinamese citizens',
  'Swazi citizens',
  'Swedish citizens',
  'Swiss citizens',
  'Syrian citizens',
  'Taiwanese citizens',
  'Tajik citizens',
  'Tanzanian citizens',
  'Thai citizens',
  'Togolese citizens',
  'Tongan citizens',
  'Transnistrian citizens',
  'Trinidad and Tobago citizens',
  'Tunisian citizens',
  'Turkish citizens',
  'Turkmen citizens',
  'Tuvaluan citizens',
  'Ugandan citizens',
  'Ukrainian citizens',
  'Emirati citizens',
  'United States citizens',
  'Uruguayan citizens',
  'Uzbekistani citizens',
  'Vanuatuan citizens',
  'Vatican citizens',
  'Venezuelan citizens',
  'Vietnamese citizens',
  'crew members',
  'EFTA nationals',
  'Estonian non-citizens',
  'holders of passports issued by the Sovereign Military Order of Malta',
  'Kosovan citizens',
  'Latvian non-citizens',
  'Norwegian citizens',
  'Sierra Leonean citizens',
  'Somali citizens',
  'Yemeni citizens',
  'Zambian citizens',
  'Zimbabwean citizens'];

const promptsNationality = (session) => {
  if (session.message.address.channelId !== 'emulator') {
    builder.Prompts.text(session, 'What is your nationality?');
  } else {
    const choices = VISA_COUNTRIES.map(choice => ({
      title: choice,
      value: `${choice.replace(' ', '_')}`,
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
    session.send('Please select your nationality or residence status from the dropdown bellow:');
    session.send(visaMsg);
  }
};

const upsell = (session) => {
  session.send('Visas can be very annoying...');
  const msg = new builder.Message(session)
    .text('What`s next? 👈😎👈')
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
      builder.CardAction.openUrl(session, `https://en.wikipedia.org/wiki/Visa_requirements_for_${visa || session.message.value.visaCountrySelect}#Visa_requirements`, 'Your Visa Requirements'),
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
  session.send(`Let me just look up the visa info for ${result[0]}`);
  processRequest(session, result[0]);
};

module.exports = {
  promptsNationality,
  processNationality,
  processRequest,
};

const builder = require('botbuilder');

const strings = require('./strings');
const LATEST = require('./data/latest');

const constructFollowUp = (session, type) => {
  const button = strings.get(type, 'followUpButtonText', 'eng');
  const response = strings.get(type, 'followUpButtonResponse', 'eng');
  return new builder.Message(session)
    .text('Would you like to')
    .suggestedActions(builder.SuggestedActions.create(session, [
      builder.CardAction.imBack(session, response, button),
      builder.CardAction.imBack(session, 'Forget my session', 'Forget it'),
    ]));
};

const prompt = (bot) => {
  console.log(LATEST);
  let text = strings.get(LATEST.type, 'followUp', 'eng');
  console.log(typeof text);
  if (LATEST.destination && LATEST.destination.toLocaleLowerCase() !== 'anywhere') {
    const parts = text;
    text = parts[0] + LATEST.destination + parts[1];
  } else if (typeof text === 'object') {
    bot.send(new builder.Message()
      .address(LATEST.address)
      .text('Something went wrong'));
    return -1;
  }
  bot.send(new builder.Message()
    .address(LATEST.address)
    .text(text, LATEST.destination));
  const message = constructFollowUp(undefined, LATEST.type);
  setTimeout(() => {
    bot.send(message.address(LATEST.address));
  }, 200);
  return 1;
};

module.exports = {
  prompt,
};

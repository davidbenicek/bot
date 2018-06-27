const builder = require('botbuilder');

const strings = require('./strings');

const hello = (session) => {
  session.dialogData.trip = {};
  [session.dialogData.name] = session.message.address.user.name.split(' ');
  session.send(strings.get('pleasantries', 'hello', 'eng'), session.dialogData.name);
  const msg = new builder.Message(session)
    .text('Some of the things you could do are:')
    .suggestedActions(builder.SuggestedActions.create(session, [
      builder.CardAction.imBack(session, 'Book me a flight', '✈️ Book a flight'),
      builder.CardAction.imBack(session, 'Book accommodation', '🏠 Book accommodation'),
      builder.CardAction.imBack(session, 'Tell me about things to do', '📍 Things to do'),
      builder.CardAction.imBack(session, 'Send me visa information', '🛂 Visa info'),
    ]));
  session.send(msg);
};

const misunderstanding = (session) => {
  session.send(strings.get('pleasantries','misunderstanding','eng'), session.message.text);
  session.send(strings.get('pleasantries','improvement','eng'));

}

const goodbye = (session) => {
  session.send(strings.get('pleasantries', 'goodbye', 'eng'));
};

const thanks = (session) => {
  session.send(strings.get('pleasantries', 'thanks', 'eng'));
};

const joke = (session) => {
  session.send(strings.get('pleasantries', 'jokes', 'eng'));
};

module.exports = {
  hello,
  misunderstanding,
  goodbye,
  thanks,
  joke,
};

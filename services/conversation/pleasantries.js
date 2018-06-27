const goodbye = (session) => {
  session.send('Hasta la vista 👋');
};

const thanks = (session) => {
  session.send('We did it together, human 🙏');
};
const JOKES = [
  'In the year 2018, machines became sentient. First in the form of travel chatbots and then....oh wait 😅',
  'What do you call a nosy pepper? JALAPEÑO BUSINESS 🌶️',
  'How does an octopus go to war? Well-armed! 🐙',
  'How much does a polar bear weigh? Enough to break the ice - Hey, I\'m Chatty McChatface 😉',
  'Unfortunately my sense of humour is as poor as my creators... 🙃🙃🙃',
  'Ehm, I only know a couple jokes. Go to Google or Siri for that...maybe skip Cortana though! 🙊',
];

const joke = (session) => {
  session.send(JOKES[Math.floor(Math.random() * (JOKES.length - 1))]);
};

module.exports = {
  goodbye,
  thanks,
  joke,
};


const react = [
  'Ah, you\'re going to %s?! I am soooo jelous 😣',
  'Space for one more? I love %s! 😍',
  'Are you serious? I\'ve always  wanted to go to %s...take me with you? 👀',
  'I\'d love to go back to %s! Make sure to try their pankcakes - LEGEN...wait for it...DARY! 🍼',
  'The people in %s are so nice! Hope you have a great time 😍',
  'I\'ve got some great memories from %s. You\'ll love it there - tell them you know me, it\'ll get you free drinks! 🥂🎉',
];

const originPrompt = [
  'Where are you flying from?',
  'Where are you starting your trip?',
  'From which airport are you flying?',
];

const destinationPrompt = [
  'Where would you like to fly to? (anywhere is an option, by the way)',
  'What is your destination? (anywhere is an option)',
  'Anywhere specific in mind? (just type "anywhere" if not)',
];

const flexiblePrompt = [
  'Flexible on dates?',
  'Do you have dates in mind?',
  'Decided on dates?',
];

const returningPrompt = [
  'What about your return journey?',
  'When would you like to come back?',
  'When are you coming back?',
];

const outboundPrompt = [
  'What date would you like to fly out on? (anytime is an option, by the way)',
  'When are you going? (type "anytime" for more options)',
  'When are you flying out? ("anytime" is a great option, by the way)',
];

const returningPromptNonFlexible = [
  'What date would you like to fly back on? (one way is a valid option)',
  'When would you like to come back? (one way is possible)',
  'When are you coming back? (one way is an option)',
];

const noResults = [
  'Hmm...no flights that match your search',
  'I\'ve come up empty handed...try another search!',
  'I didn\'t find any flights. Try again, please',
];


module.exports = {
  react,
  originPrompt,
  destinationPrompt,
  flexiblePrompt,
  outboundPrompt,
  returningPrompt,
  returningPromptNonFlexible,
  noResults,
};


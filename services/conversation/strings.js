const STRINGS = {
  accomodation: module.require('./data/eng/accomodation'),
  flights: module.require('./data/eng/flights'),
  upsell: module.require('./data/eng/upsell'),
  error: module.require('./data/eng/error'),
  pleasantries: module.require('./data/eng/pleasantries'),
  thingsToDo: module.require('./data/eng/thingsToDo'),
  visa: module.require('./data/eng/visa'),
};

const get = (context, event) => {
  try {
    return STRINGS[context][event][Math.floor(STRINGS[context][event].length * Math.random())];
  } catch (err) {
    console.log(err);
    return 'Ehm, looks like my language module is broken...😢 Try again later please!';
  }
};

module.exports = {
  get,
};

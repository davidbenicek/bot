/* Global for formatter.test */
const expected = {};

const blankSession = {
  gettext: text => (text),
};

/* Testing ensureDateIsNotPast */

const luisDate30thMay = { timex: 'XXXX-WXX-3', type: 'date', value: '2018-05-30' };
const luisDate6thJune = { timex: 'XXXX-WXX-3', type: 'date', value: '2018-06-06' };

const today = new Date();
const dateTomorrow = (new Date(today.getTime() + (24 * 60 * 60 * 1000)))
  .toISOString().substring(0, 10);

const luisTomorrow = { timex: 'XXXX-WXX-3', type: 'date', value: dateTomorrow };


/* Testing formatRoutesIntoCards */

const twoRoutes = [{
  destination: {
    name: 'destination1',
    code: 'destination_code1',
  },
  origin: {
    name: 'origin1',
    code: 'origin_code1',
  },
  currency: {
    Symbol: '£',
  },
  price: 100,
}, {
  destination: {
    name: 'destination2',
    code: 'destination_code2',
  },
  origin: {
    name: 'origin2',
    code: 'origin_code2',
  },
  currency: {
    Symbol: '£',
  },
  price: 99,
}];

expected.twoRoutes = [{
  buttons: [
    {
      title: 'Book!',
      type: 'openUrl',
      value: 'https://www.skyscanner.net/transport/flights/origin_code2/destination_code2/',
    },
  ],
  images: [
    {
      url: 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg',
    },
  ],
  subtitle: 'How do you fancy a trip to  destination2?',
  text: 'Fly from origin2 to destination2 for £99!',
  title: 'destination2',
}, {
  buttons: [
    {
      title: 'Book!',
      type: 'openUrl',
      value: 'https://www.skyscanner.net/transport/flights/origin_code1/destination_code1/',
    },
  ],
  images: [
    {
      url: 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg',
    },
  ],
  subtitle: 'How do you fancy a trip to  destination1?',
  text: 'Fly from origin1 to destination1 for £100!',
  title: 'destination1',
}, {
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'https://www.skyscanner.net',
    },
  ],
  images: [
    {
      url: 'https://palife.co.uk/wp-content/uploads/2017/08/skyscanner.jpg',
    },
  ],
  subtitle: 'The worlds travel engine',
  text: 'There are plenty other great deals for flights, hotels, car hire and rail on the Skyscanner website',
  title: 'Book more trips with Skyscanner',
},
];

/* Testing formatQuotesIntoCards */

const twoQuotesWithReturn = [{
  currency: {
    Symbol: '£',
  },
  price: 100,
  outbound: {
    carrier: {
      name: 'carrier_out1',
    },
    origin: {
      name: 'outbound_origin1',
    },
    destination: {
      name: 'outbound_destination1',
    },
  },
  inbound: {
    carrier: {
      name: 'carrier_in1',
    },
    origin: {
      name: 'inbound_origin1',
    },
    destination: {
      name: 'inbound_destination1',
    },
  },
}, {
  currency: {
    Symbol: '£',
  },
  price: 99,
  outbound: {
    carrier: {
      name: 'carrier_out2',
    },
    origin: {
      name: 'outbound_origin2',
    },
    destination: {
      name: 'outbound_destination2',
    },
  },
  inbound: {
    carrier: {
      name: 'carrier_in2',
    },
    origin: {
      name: 'inbound_origin2',
    },
    destination: {
      name: 'inbound_destination2',
    },
  },
}];

expected.twoQuotesWithReturn = [{
  title: 'Option #1: for £99',
  subtitle: 'Flying out with carrier_out2 and back with carrier_in2',
  text: 'Fly from outbound_origin2 to outbound_destination2 and back from inbound_origin2 to  inbound_destination2',
  buttons: [
    {
      title: 'Book!',
      type: 'openUrl',
      value: 'https://www.skyscanner.net/',
    },
  ],
  images: [
    {
      url: 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg',
    },
  ],
}, {
  title: 'Option #2: for £100',
  subtitle: 'Flying out with carrier_out1 and back with carrier_in1',
  text: 'Fly from outbound_origin1 to outbound_destination1 and back from inbound_origin1 to  inbound_destination1',
  buttons: [
    {
      title: 'Book!',
      type: 'openUrl',
      value: 'https://www.skyscanner.net/',
    },
  ],
  images: [
    {
      url: 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg',
    },
  ],
}, {
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'https://www.skyscanner.net',
    },
  ],
  images: [
    {
      url: 'https://palife.co.uk/wp-content/uploads/2017/08/skyscanner.jpg',
    },
  ],
  subtitle: 'The worlds travel engine',
  text: 'There are plenty other great deals for flights, hotels, car hire and rail on the Skyscanner website',
  title: 'Book more trips with Skyscanner',
},
];

const twoQuotesOneWay = [{
  currency: {
    Symbol: '£',
  },
  price: 100,
  outbound: {
    carrier: {
      name: 'carrier_out1',
    },
    origin: {
      name: 'outbound_origin1',
    },
    destination: {
      name: 'outbound_destination1',
    },
  },
}, {
  currency: {
    Symbol: '£',
  },
  price: 99,
  outbound: {
    carrier: {
      name: 'carrier_out2',
    },
    origin: {
      name: 'outbound_origin2',
    },
    destination: {
      name: 'outbound_destination2',
    },
  },
}];

expected.twoQuotesOneWay = [{
  buttons: [
    {
      title: 'Book!',
      type: 'openUrl',
      value: 'https://www.skyscanner.net/',
    },
  ],
  images: [
    {
      url: 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg',
    },
  ],
  subtitle: 'Flying out with carrier_out2 ',
  text: 'Fly from outbound_origin2 to outbound_destination2 ',
  title: 'Option #1: for £99',
}, {
  buttons: [
    {
      title: 'Book!',
      type: 'openUrl',
      value: 'https://www.skyscanner.net/',
    },
  ],
  images: [
    {
      url: 'https://secure.i.telegraph.co.uk/multimedia/archive/01692/flight-gill_1692367c.jpg',
    },
  ],
  subtitle: 'Flying out with carrier_out1 ',
  text: 'Fly from outbound_origin1 to outbound_destination1 ',
  title: 'Option #2: for £100',
}, {
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'https://www.skyscanner.net',
    },
  ],
  images: [
    {
      url: 'https://palife.co.uk/wp-content/uploads/2017/08/skyscanner.jpg',
    },
  ],
  subtitle: 'The worlds travel engine',
  text: 'There are plenty other great deals for flights, hotels, car hire and rail on the Skyscanner website',
  title: 'Book more trips with Skyscanner',
}];

module.exports = {
  blankSession,
  luisDate30thMay,
  luisDate6thJune,
  luisTomorrow,
  dateTomorrow,
  twoRoutes,
  twoQuotesWithReturn,
  twoQuotesOneWay,
  expected,
};

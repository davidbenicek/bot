/* Global for formatter.test */
const expected = {};

const blankSession = {
  gettext: text => (text),
  dialogData: {
    trip: {
      destination: 'somewhere',
    },
  },
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
    name: 'Prague',
    code: 'destination_code1',
  },
  origin: {
    name: 'London',
    code: 'origin_code1',
  },
  currency: {
    Symbol: '£',
  },
  price: 100,
}, {
  destination: {
    name: 'Berlin',
    code: 'destination_code2',
  },
  origin: {
    name: 'Rome',
    code: 'origin_code2',
  },
  currency: {
    Symbol: '£',
  },
  price: 99,
}];

expected.twoRoutes = [{
  title: 'Berlin',
  subtitle: 'How do you fancy a trip to  Berlin?',
  text: 'Fly from Rome to Berlin for £99!',
  images: [{ url: 'some image' }],
  buttons: [{
    type: 'openUrl',
    value: 'https://www.skyscanner.net/transport/flights/origin_code2/destination_code2/',
    title: 'Go to Skyscanner',
  }],
}, {
  title: 'Prague',
  subtitle: 'How do you fancy a trip to  Prague?',
  text: 'Fly from London to Prague for £100!',
  images: [{ url: 'some image' }],
  buttons:
 [{
   type: 'openUrl',
   value: 'https://www.skyscanner.net/transport/flights/origin_code1/destination_code1/',
   title: 'Go to Skyscanner',
 }],
}, {
  title: 'Book more trips with Skyscanner',
  subtitle: 'The worlds travel engine',
  text: 'There are plenty other great deals for flights, hotels, car hire and rail on the Skyscanner website',
  images:
 [{ url: 'https://palife.co.uk/wp-content/uploads/2017/08/skyscanner.jpg' }],
  buttons:
 [{
   type: 'openUrl',
   value: 'https://www.skyscanner.net',
   title: 'More on Skyscanner',
 }],
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
      code: 'code1',
    },
    destination: {
      name: 'outbound_destination1',
      code: 'code2',
    },
    date: '2018-11-11',
  },
  inbound: {
    carrier: {
      name: 'carrier_in1',
    },
    origin: {
      name: 'inbound_origin1',
      code: 'code1',
    },
    destination: {
      name: 'inbound_destination1',
      code: 'code2',
    },
    date: '2018-11-15',
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
      code: 'code2',
    },
    destination: {
      name: 'outbound_destination2',
      code: 'code3',
    },
    date: '2018-11-11',
  },
  inbound: {
    carrier: {
      name: 'carrier_in2',
    },
    origin: {
      name: 'inbound_origin2',
      code: 'code2',
    },
    destination: {
      name: 'inbound_destination2',
      code: 'code3',
    },
    date: '2018-11-15',
  },
}];

expected.twoQuotesWithReturn = [{
  title: 'To somewhere for £99',
  subtitle: 'Flying out with carrier_out2 and back with carrier_in2',
  text: 'Fly from outbound_origin2 to outbound_destination2 and back from inbound_origin2 to  inbound_destination2',
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'http://skyscanner.net/transport/flights/code2/code3/181111/181115',
    },
  ],
  images: [
    {
      url: 'some image',
    },
  ],
}, {
  title: 'To somewhere for £100',
  subtitle: 'Flying out with carrier_out1 and back with carrier_in1',
  text: 'Fly from outbound_origin1 to outbound_destination1 and back from inbound_origin1 to  inbound_destination1',
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'http://skyscanner.net/transport/flights/code1/code2/181111/181115',
    },
  ],
  images: [
    {
      url: 'some image',
    },
  ],
}, {
  buttons: [
    {
      title: 'More on Skyscanner',
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
      code: 'code1',
    },
    destination: {
      name: 'outbound_destination1',
      code: 'code2',
    },
    date: '2018-11-11',
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
      code: 'code1',
    },
    destination: {
      name: 'outbound_destination2',
      code: 'code2',
    },
    date: '2018-11-11',
  },
}];

expected.twoQuotesOneWay = [{
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'http://skyscanner.net/transport/flights/code1/code2/181111/',
    },
  ],
  images: [
    {
      url: 'some image',
    },
  ],
  subtitle: 'Flying out with carrier_out2 ',
  text: 'Fly from outbound_origin2 to outbound_destination2 ',
  title: 'To somewhere for £99',
}, {
  buttons: [
    {
      title: 'Go to Skyscanner',
      type: 'openUrl',
      value: 'http://skyscanner.net/transport/flights/code1/code2/181111/',
    },
  ],
  images: [
    {
      url: 'some image',
    },
  ],
  subtitle: 'Flying out with carrier_out1 ',
  text: 'Fly from outbound_origin1 to outbound_destination1 ',
  title: 'To somewhere for £100',
}, {
  buttons: [
    {
      title: 'More on Skyscanner',
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

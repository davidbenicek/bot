const expected = {};

const routes = [{
  Price: 99,
  OriginId: '1',
  DestinationId: '2',
}, {
  Price: 100,
  OriginId: '1',
  DestinationId: '3',
}];

const places = [{
  PlaceId: '1',
  Name: 'place1',
  Type: 'type1',
  SkyscannerCode: 'code1',
}, {
  PlaceId: '2',
  Name: 'place2',
  Type: 'type2',
  SkyscannerCode: 'code2',
}, {
  PlaceId: '3',
  Name: 'place3',
  Type: 'type3',
  SkyscannerCode: 'code3',
}];

const currency = {
  Symbol: '£',
};

expected.formatRoutesData = [ { origin: { name: 'place1', type: 'type1', code: 'code1' },
destination: { name: 'place3', type: 'type3', code: 'code3' },
currency: { Symbol: '£' },
price: 100 },
{ origin: { name: 'place1', type: 'type1', code: 'code1' },
destination: { name: 'place2', type: 'type2', code: 'code2' },
currency: { Symbol: '£' },
price: 99 } ];

module.exports = {
  routes,
  places,
  currency,
  expected,
};

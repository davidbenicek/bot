
const assert = require('assert');

const skyscanner = require('../services/skyscanner');
const data = require('./data/skyscannerData');

describe('Skyscanner', () => {
  describe('.formatRoutesData', () => {
    it('should throw error if no args are passed in', async () => {
      try {
        await skyscanner.formatRoutesData();
      } catch (err) {
        assert.equal(err, 'Error: You must specify routes, places and a currency for formatRoutesData');
      }
    });
    it('should throw error if no places array is passed in', async () => {
      try {
        await skyscanner.formatRoutesData(data.routes);
      } catch (err) {
        assert.equal(err, 'Error: You must specify routes, places and a currency for formatRoutesData');
      }
    });
    it('should throw error if no currency array is passed in', async () => {
      try {
        await skyscanner.formatRoutesData(data.routes, data.places);
      } catch (err) {
        assert.equal(err, 'Error: You must specify routes, places and a currency for formatRoutesData');
      }
    });
    it('should throw error if no places array is passed in', async () => {
      const res = await skyscanner.formatRoutesData(data.routes, data.places, data.currency);
      assert.deepEqual(res, data.expected.formatRoutesData);
    });
  });
});

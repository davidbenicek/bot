
const assert = require('assert');

const formatter = require('../services/util/formatter');

describe('Formatter', () => {
  describe('.ensureDateIsNotPast', () => {
    it('should return date before reference date', () => {
      const input = [{ timex: 'XXXX-WXX-3', type: 'date', value: '2018-05-30' }, { timex: 'XXXX-WXX-3', type: 'date', value: '2018-06-06' }];
      const [res] = formatter.ensureDateIsNotPast(input, '2018-06-05');
      assert.equal(res.value, '2018-06-06');
    });

    it('should return date not in the past', () => {
      const today = new Date();
      const tomorrow = (new Date(today.getTime() + (24 * 60 * 60 * 1000)))
        .toISOString().substring(0, 10);
      const input = [{ timex: 'XXXX-WXX-3', type: 'date', value: '2018-05-30' }, { timex: 'XXXX-WXX-3', type: 'date', value: tomorrow }];
      const [res] = formatter.ensureDateIsNotPast(input);
      assert.equal(res.value, tomorrow);
    });

    it('should throw if no date is passed in', () => {
      try {
        formatter.ensureDateIsNotPast();
      } catch (err) {
        assert.equal(err, 'Error: Must specify array of at least one input date');
      }
    });
  });
});


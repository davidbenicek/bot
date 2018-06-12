
const assert = require('assert');

const formatter = require('../services/util/formatter');
const data = require('./data/formatterTestData');

describe('Formatter', () => {
  describe('.ensureDateIsNotPast', () => {
    it('should return date before reference date', () => {
      const [res] = formatter.ensureDateIsNotPast([data.luisDate30thMay, data.luisDate6thJune], '2018-06-05');
      assert.equal(res.value, '2018-06-06');
    });

    it('should return date not in the past', () => {
      const [res] = formatter.ensureDateIsNotPast([data.luisDate30thMay, data.luisTomorrow]);
      assert.equal(res.value, data.dateTomorrow);
    });

    it('should throw if no date is passed in', () => {
      try {
        formatter.ensureDateIsNotPast();
      } catch (err) {
        assert.equal(err, 'Error: Must specify array of at least one input date');
      }
    });
  });

  describe('.formatRoutesIntoCards', () => {
    it('should return three cards with properly formated buttons', () => {
      const cards = formatter.formatRoutesIntoCards(data.blankSession, data.twoRoutes);
      assert.equal(cards.length, 3);
      assert.deepEqual(
        cards[0].data.content,
        data.expected.twoRoutes[0],
      );
      assert.deepEqual(
        cards[1].data.content,
        data.expected.twoRoutes[1],
      );
      assert.deepEqual(
        cards[2].data.content,
        data.expected.twoRoutes[2],
      );
    });

    it('should throw if no session is passed in', () => {
      try {
        formatter.formatRoutesIntoCards();
      } catch (err) {
        assert.equal(err, 'Error: Must specify a session for building cards in formatRoutesIntoCards');
      }
    });

    it('should throw if no flights array is passed in', () => {
      try {
        formatter.formatRoutesIntoCards(data.blankSession);
      } catch (err) {
        assert.equal(err, 'Error: Must specify an array for flight for formatRoutesIntoCards');
      }
    });
  });

  describe('.formatQuotesIntoCards', () => {
    it('should return three cards with return flights', () => {
      const cards = formatter.formatQuotesIntoCards(data.blankSession, data.twoQuotesWithReturn);
      assert.equal(cards.length, 3);
      assert.deepEqual(
        cards[0].data.content,
        data.expected.twoQuotesWithReturn[0],
      );
      assert.deepEqual(
        cards[1].data.content,
        data.expected.twoQuotesWithReturn[1],
      );
      assert.deepEqual(
        cards[2].data.content,
        data.expected.twoQuotesWithReturn[2],
      );
    });

    it('should return three cards with one way flights', () => {
      const cards = formatter.formatQuotesIntoCards(data.blankSession, data.twoQuotesOneWay);
      assert.equal(cards.length, 3);
      assert.deepEqual(
        cards[0].data.content,
        data.expected.twoQuotesOneWay[0],
      );
      assert.deepEqual(
        cards[1].data.content,
        data.expected.twoQuotesOneWay[1],
      );
      assert.deepEqual(
        cards[2].data.content,
        data.expected.twoQuotesOneWay[2],
      );
    });

    it('should throw if no session is passed in', () => {
      try {
        formatter.formatQuotesIntoCards();
      } catch (err) {
        assert.equal(err, 'Error: Must specify a session for building cards in formatQuotesIntoCards');
      }
    });

    it('should throw if no flights array is passed in', () => {
      try {
        formatter.formatQuotesIntoCards(data.blankSession);
      } catch (err) {
        assert.equal(err, 'Error: Must specify an array for flight for formatQuotesIntoCards');
      }
    });
  });
});

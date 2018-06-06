const ensureDateIsNotPast = (inputDates, boundaryDate) => {
  if (!inputDates) throw new Error('Must specify array of at least one input date');

  const dateToBeat = (!boundaryDate) ? new Date() : new Date(boundaryDate);
  const dates = inputDates.filter(date => new Date(date.value) > dateToBeat);

  return dates;
};

module.exports = {
  ensureDateIsNotPast,
};

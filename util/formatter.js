const ensureDateIsNotPast = (inputDates, boundaryDate) => {
  const dateToBeat = (!boundaryDate) ? new Date() : new Date(boundaryDate);
  const dates = inputDates.filter(date => new Date(date.value) > dateToBeat);
  console.log('Date found', dates);
  return dates;
};

module.exports = {
  ensureDateIsNotPast,
};

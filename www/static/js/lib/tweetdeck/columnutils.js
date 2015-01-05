var columnTitles = {
  'home': 'Home',
  'mentions': 'Mentions',
};

module.exports.getTitle = function getTitle(feedtype) {
  return columnTitles[feedtype];
};

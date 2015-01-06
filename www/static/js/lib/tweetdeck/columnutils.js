var columnTitles = {
  'home': 'Home',
  'mentions': 'Mentions',
};

module.exports = {
    getTitle(feedtype) {
      return columnTitles[feedtype];
    },

    sort: {
        byDate(a, b) {
          return b.date - a.date;
        }
    }
}

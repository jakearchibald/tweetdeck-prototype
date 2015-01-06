var columnTitles = {
  'home': 'Home',
  'mentions': 'Mentions',
};

var getId = (_, item) => item.id;

module.exports = {
    getTitle(feedtype) {
      return columnTitles[feedtype];
    },

    sort: {
        byDate(a, b) {
          return b.date - a.date;
        }
    },

    cursor: {
      up(items) {
        return {
          query: {
            since_id: items.slice(0, 1).reduce(getId, null)
          }
        };
      },

      down(items) {
        return {
          query: {
            max_id: items.slice(-1).reduce(getId, null)
          }
        };
      }
    }
}

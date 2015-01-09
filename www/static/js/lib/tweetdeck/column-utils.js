var TweetInterval = require('../tweet-interval');

var columnTitles = {
  'home': 'Home',
  'mentions': 'Mentions',
};

var getData = (_, tweet) => {
  return {
    id_str: tweet.id_str,
    created_at: new Date(tweet.created_at).getTime()
  }
};

module.exports = {
  getTitle(feedtype) {
    return columnTitles[feedtype];
  },

  cursor: {
    /**
     * Make a cursor for paging upwards. We use the second tweet's id so that the API returns
     * an overlap if it can, which makes gap detection possible, but we use the top tweet's date
     * for the interval so that the result has the overlap tweet filtered out.
     */
    up(requestResult) {
      if (!requestResult.result.length) {
        return requestResult.request.cursor;
      }
      var topTweets = requestResult.result.slice(0, 2);
      var idSourceData = topTweets.slice(-1).reduce(getData, null);
      var dateSourceData = topTweets.slice(0,1).reduce(getData, null);
      if (requestResult.length === 1) {
        dateSourceData = requestResult.request.cursor.interval.from;
      }

      var interval = (
        dateSourceData ?
          new TweetInterval(
            TweetInterval.excEnd(dateSourceData),
            TweetInterval.posInf
          ) :
          TweetInterval.whole
      );
      return {
        type: 'up',
        interval: interval,
        query: {
          since_id: (
            idSourceData || dateSourceData ?
              (idSourceData || dateSourceData).id_str :
              null
          )
        }
      };
    },

    down(requestResult) {
      if (!requestResult.result.length) {
        return requestResult.request.cursor;
      }
      var bottomTweetData = requestResult.result.slice(-1).reduce(getData, null);
      var interval = (
        bottomTweetData ?
          new TweetInterval(
            TweetInterval.negInf,
            TweetInterval.excEnd(bottomTweetData)
          ) :
          TweetInterval.whole
      );
      return {
        type: 'down',
        interval: interval,
        query: {
          max_id: (bottomTweetData ? bottomTweetData.id_str : null)
        }
      };
    }
  }
}

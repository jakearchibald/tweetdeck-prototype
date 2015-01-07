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

  sort: {
    byDate(a, b) {
      return b.date - a.date;
    },

    byCreatedAtAsc(a, b) {
      return (new Date(a.created_at).getTime()) - (new Date(b.created_at).getTime());
    },

    byCreatedAtDesc(a, b) {
      return (new Date(b.created_at).getTime()) - (new Date(a.created_at).getTime());
    }
  },

  cursor: {
    up(requestResult) {
      if (!requestResult.result.length) {
        return requestResult.request.cursor;
      }
      var topTweetData = requestResult.result.slice(0, 1).reduce(getData, null);
      var interval = (
        topTweetData ?
          new TweetInterval(
            TweetInterval.excEnd(topTweetData),
            TweetInterval.posInf
          ) :
          TweetInterval.whole
      );
      return {
        interval: interval,
        query: {
          since_id: (topTweetData ? topTweetData.id_str : null)
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
        interval: interval,
        query: {
          max_id: (bottomTweetData ? bottomTweetData.id_str : null)
        }
      };
    }
  }
}

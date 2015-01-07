var TweetInterval = require('./tweet-interval');
var _ = require('lodash');

module.exports = {
    makeOrderedStoreObjectFromTweet(tweet) {
      return {
        id_str: tweet.id_str,
        created_at: new Date(tweet.created_at).getTime()
      };
    },

    makeIntervalFromTweets(tweets) {
      return (tweets.length ?
        new TweetInterval(
          TweetInterval.inclusiveEndpoint(_.last(tweets)),
          TweetInterval.inclusiveEndpoint(_.first(tweets))
        ) :
        TweetInterval.empty
      );
    }
}

var _ = require('lodash');
var TweetInterval = require('./tweet-interval');
var columnUtils = require('./tweetdeck/columnUtils');
var { Request, RequestResult } = require('./request-result');
window.TweetInterval = TweetInterval;

function makeIntervalFromTweets(tweets) {
  return (tweets.length ?
    new TweetInterval(
      TweetInterval.inclusiveEndpoint(_.last(tweets)),
      TweetInterval.inclusiveEndpoint(_.first(tweets))
    ) :
    TweetInterval.empty
  );
}

class MemoryOrderedStore {
  constructor() {
    this.store = [];
  }

  fetch(request) {
    return new Promise(resolve => resolve(this.doFetch(request)));
  }

  doFetch(request) {
    // By default, request absolutely everything
    const requestInterval = request.cursor.interval || TweetInterval.whole;
    const storeInterval = makeIntervalFromTweets(this.store);

    if (storeInterval.empty) {
      throw Error('Store is empty');
    }

    if (requestInterval.intersection(storeInterval).empty) {
      throw Error('Request cannot be satisfied by store');
    }

    // Return tweets that are within the requested interval and are before a gap
    var result = _.chain(this.store)
      .filter(requestInterval.contains, requestInterval)
      .take(tweet => !tweet.isGap)
      .value();

    return new RequestResult(request, result);
  }

  putRequestResult(requestResult) {
    this.store = this.store
      .concat(requestResult.result.map(this.tweetToStoreObject))
      .sort(columnUtils.sort.byCreatedAtDesc)
      // Dedupe
      .reduce(
        (memo, tweet) => {
          if (!memo.seenIds[tweet.id_str]) {
            memo.newStore.push(tweet);
            memo.seenIds[tweet.id_str] = true;
          }
          return memo;
        },
        { newStore: [], seenIds: {} }
      )
      .newStore;
    return requestResult;
  }

  tweetToStoreObject(tweet) {
    return {
      id_str: tweet.id_str,
      created_at: new Date(tweet.created_at).getTime()
    };
  }
}

module.exports = MemoryOrderedStore;

var _ = require('lodash');
var TweetInterval = require('./tweet-interval');
var sortUtils = require('./tweetdeck/sort-utils');
var { Request, RequestResult } = require('./request-result');
var storeUtils = require('./store-utils')

class MemoryOrderedStore {
  constructor() {
    this.store = [];
  }

  fetch(request) {
    const requestInterval = request.cursor.interval || TweetInterval.whole;

    // Return tweets that are within the requested interval and are before a gap
    var result = _.chain(this.store)
      .filter(requestInterval.contains, requestInterval)
      .take(tweet => !tweet.isGap)
      .value();

    return Promise.resolve(
      new RequestResult(request, result)
    );
  }

  getStoreInterval() {
    return new Promise(resolve =>
      resolve(storeUtils.makeIntervalFromTweets(this.store))
    );
  }

  clear() {
    return new Promise(resolve =>
      resolve(this.store = [])
    );
  }

  putRequestResult(requestResult) {
    this.store = this.store
      .concat(
        requestResult.result.map(
          storeUtils.makeOrderedStoreObjectFromTweet
        )
      )
      .sort(sortUtils.byCreatedAtDesc)
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
}

module.exports = MemoryOrderedStore;

var _ = require('lodash');
var TweetInterval = require('./tweet-interval');
var sortUtils = require('./tweetdeck/sort-utils');
var { Request, RequestResult } = require('./request-result');
var storeUtils = require('./store-utils')
var IndexedDouchebag = require('./indexeddouchebag');

class IDBOrderedStore {
  constructor() {
    this.storeName = 'temporary-everything-store';
    this.temporaryEverythingStoreKey = 'everything';
    this.store = new IndexedDouchebag('ordered-store', 1, (db, oldVersion) => {
        if (oldVersion < 1 || oldVersion === 9223372036854776000) {
            db.createObjectStore(this.storeName);
        }
    });
  }

  fetch(request) {
    return this.getEverything()
      .then(store => {
        const requestInterval = request.cursor.interval || TweetInterval.whole;

        // Return tweets that are within the requested interval and are before a gap
        var result = _.chain(store)
          .filter(requestInterval.contains, requestInterval)
          .take(tweet => !tweet.isGap)
          .value();

        return new RequestResult(request, result)
      });
  }

  getStoreInterval() {
    return this.store.get(this.storeName, this.temporaryEverythingStoreKey)
      .then(storeUtils.makeIntervalFromTweets)
  }

  getEverything() {
    return this.store.get(this.storeName, this.temporaryEverythingStoreKey);
  }

  clear() {
    return this.store.put(this.storeName, this.temporaryEverythingStoreKey, []);
  }

  putRequestResult(requestResult) {
    return this.getEverything()
      .then(store => {
        var newStore = (store || [])
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
        return this.store.put(this.storeName, this.temporaryEverythingStoreKey, newStore);
      })
      .then(_ => requestResult);
  }
}

module.exports = IDBOrderedStore;

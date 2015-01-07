var _ = require('lodash');
var client = require('./client');
var columnUtils = require('./tweetdeck/columnutils');
var MemoryOrderedStore = require('./memory-ordered-store');
var TweetStore = require('./tweet-store');
var TweetInterval = require('./tweet-interval');
var { Request, RequestResult } = require('./request-result');

class TimelineStore {
  constructor(opts={}) {
    this.orderedStore = opts.orderedStore || new MemoryOrderedStore();
    this.tweetStore = opts.tweetStore || new TweetStore();
    this.upstream = opts.upstream || client;
    this.blockSize = opts.blockSize || 20;
  }

  fetch(request) {
    // get requested range from store
    return this.fetchFromStore(request)
      .then(this.populateResultFromTweetStore.bind(this))
      .catch(why => {
        console.log('Going to network. (%s)\n%s', why.message, why.stack.split('\n').slice(1).join('\n'));
        // Go upstrem to satisfy the request (this might be network, could be idb)
        return this.upstream.fetch(request)
          // Add whatever we got from upstream to the tweetStore
          .then(requestResult => this.tweetStore.putRequestResult(requestResult))
          // ... and to the ordered store
          .then(requestResult => this.orderedStore.putRequestResult(requestResult));
      })
      .then(this.limitResultSizeTo(this.blockSize))
      .then(this.makeCursorFromResult);
  }

  fetchFromStore(request) {
    return this.orderedStore.getStoreInterval(request)
      .then(storeInterval => {
        // By default, request absolutely everything
        const requestInterval = request.cursor.interval || TweetInterval.whole;

        // We can't produce results from an empty store
        if (storeInterval.empty) {
          throw Error('Store is empty');
        }

        // To satisfy the request from the store, there must be an intersection
        // in the request and store interval
        if (requestInterval.intersection(storeInterval).empty) {
          throw Error('Request cannot be satisfied by store');
        }

        return this.orderedStore.fetch(request);
      })
  }

  populateResultFromTweetStore(requestResult) {
    // Extract ids
    const ids = requestResult.result.map(obj => obj.id_str);
    // Get all tweets in requested range from tweetStore
    return this.tweetStore.getMany(ids)
      .then(result => new RequestResult(requestResult.request, result));
  }

  limitResultSizeTo(blockSize) {
    return (requestResult =>
      new RequestResult(
        requestResult.request,
        requestResult.result.slice(0, blockSize)
      )
    );
  }

  makeCursorFromResult(requestResult) {
    const cursors = {
      up: columnUtils.cursor.up(requestResult),
      down: columnUtils.cursor.down(requestResult)
    };

    return new RequestResult(
      requestResult.request,
      requestResult.result,
      { cursors }
    );
  }
}

module.exports = TimelineStore;

var _ = require('lodash');
var client = require('./client');
var columnUtils = require('./tweetdeck/columnutils');
var MemoryOrderedStore = require('./memory-ordered-store');
var TweetStore = require('./tweet-store');
var { Request, RequestResult } = require('./request-result');

class TimelineStore {
  constructor(opts={}) {
    this.orderedStore = opts.orderedStore || new MemoryOrderedStore();
    this.tweetStore = opts.tweetStore || new TweetStore();
    this.upstream = opts.upstream || client;
  }

  fetch(request) {
    // get requested range from store
    return this.orderedStore.fetch(request)
      .then(requestResult => {
        // Extract ids
        const ids = requestResult.result.map(obj => obj.id_str);
        // Get all tweets in requested range from tweetStore
        return this.tweetStore.getMany(ids)
          .then(result => new RequestResult(requestResult.request, result));
      })
      .catch(why => {
        // Go upstrem to satisfy the request (this might be network, could be idb)
        return this.upstream.fetch(request)
          .then(requestResult => this.tweetStore.putRequestResult(requestResult))
          .then(requestResult => this.orderedStore.putRequestResult(requestResult));
      })
      .then(this.limitResultSize)
      .then(this.makeCursorFromResult);
  }

  limitResultSize(requestResult) {
    return new RequestResult(
      requestResult.request,
      requestResult.result.slice(0,20)
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

var _ = require('lodash');
var client = require('./client');
var columnUtils = require('./tweetdeck/columnutils');
var storeUtils = require('./store-utils');
var MemoryOrderedStore = require('./memory-ordered-store');
var TweetStore = require('./tweet-store');
var TweetInterval = require('./tweet-interval');
window.TweetInterval = TweetInterval;
var { Request, RequestResult } = require('./request-result');

class TimelineStore {
  constructor(opts={}) {
    this.orderedStore = opts.orderedStore || new MemoryOrderedStore();
    this.tweetStore = opts.tweetStore || new TweetStore();
    this.upstream = opts.upstream || client;
    this.blockSize = opts.blockSize || 20;
    this.gapThreshold = opts.gapThreshold || 10;
  }

  fetch(request) {
    // get requested range from store
    return this.fetchFromStore(request)
      .then(this.populateResultFromTweetStore.bind(this))
      .catch(why => {
        console.log('Going to network. (%s)\n%s', why.message, why.stack.split('\n').slice(1).join('\n'));
        // Go upstrem to satisfy the request (this might be network, could be idb)
        return this.upstream.fetch(request)
          .then(this.detectGap.bind(this))
          // Only return stuff we actually requested
          .then(this.filterByRequestInterval)
          // Add whatever we got from upstream to the tweetStore
          .then(requestResult => this.tweetStore.putRequestResult(requestResult))
          // ... and to the ordered store
          .then(requestResult => this.orderedStore.putRequestResult(requestResult));
      })
      .then(this.limitResultSizeTo.bind(this))
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
        if (storeInterval.intersection(requestInterval).empty) {
          throw Error('Request cannot be satisfied by store');
        }

        return this.orderedStore.fetch(request);
      })
  }

  detectGap(requestResult) {
    const request = requestResult.request;
    const result = requestResult.result;

    // Only looks for gaps in upward fetches, or if there was some data
    if (request.cursor.type !== 'up' || result.length < this.gapThreshold) {
      return requestResult;
    }

    // We only care about the bottom of the result, so make result cursor that matches
    // the top of the request, but keeps the bottom of the result.
    const requestInterval = request.cursor.interval || TweetInterval.whole;
    const resultInterval = new TweetInterval(
      TweetInterval.incEnd(_.last(result)),
      requestInterval.to
    );

    // There's a gap when we didn't get at least everything we asked for
    if (requestInterval.isSubsetOf(resultInterval)) {
      return requestResult;
    }

    // Clear the store if we found a gap
    return this.orderedStore.clear()
      // TODO need to clear upstream?
      .then(_ => new RequestResult(
        request,
        result,
        { containsGap: true }
      ));
  }

  filterByRequestInterval(requestResult) {
    const requestInterval = requestResult.request.cursor.interval || TweetInterval.whole;
    return new RequestResult(
      requestResult.request,
      requestResult.result.filter(requestInterval.contains, requestInterval),
      requestResult.data
    );
  }

  populateResultFromTweetStore(requestResult) {
    // Extract ids
    const ids = requestResult.result.map(obj => obj.id_str);
    // Get all tweets in requested range from tweetStore
    return this.tweetStore.getMany(ids)
      .then(result => new RequestResult(requestResult.request, result));
  }

  limitResultSizeTo(requestResult) {
    return new RequestResult(
      requestResult.request,
      requestResult.result.slice(0, this.blockSize),
      requestResult.data
    )
  }

  makeCursorFromResult(requestResult) {
    const cursors = {
      up: columnUtils.cursor.up(requestResult),
      down: columnUtils.cursor.down(requestResult)
    };

    return new RequestResult(
      requestResult.request,
      requestResult.result,
      _.extend({}, requestResult.data, { cursors })
    );
  }
}

module.exports = TimelineStore;

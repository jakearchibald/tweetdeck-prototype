var client = require('./tweetdeck/client');
var MemoryOrderedStore = require('./memory-ordered-store');
var TweetStore = require('./tweet-store');

class TimelineStore {
  constructor(opts={}) {
    this.orderedStore = opts.orderedStore || new MemoryOrderedStore();
    this.tweetStore = opts.tweetStore || new TweetStore();
    this.upstream = opts.upstream || client;
  }

  fetch(request) {
    // get requested range from store
    return this.orderedStore.fetch(request)
      // .then(ids => this.tweetStore.getByIds(ids)) // throws if missing
      .catch(why => {
        return this.upstream.fetch(request)
          // get all tweets in requested range from tweetStore
          .then(tweets => this.tweetStore.putMany(tweets))
          .then(tweets => this.orderedStore.putMany(tweets));
      })
  }
}

module.exports = TimelineStore;

var client = require('./tweetdeck/client');

class TweetStore {
  constructor(opts={}) {
    this.backend = opts.backend || client;
  }

  fetch(opts) {
    return this.backend.fetch(opts);
  }
}

module.exports = TweetStore;

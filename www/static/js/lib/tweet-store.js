var client = require('./tweetdeck/client');
var MemoryKeyValueStore = require('./memory-key-value-store');

class TweetStore {
    constructor(opts={}) {
        this.keyValueStore = opts.keyValueStore || new MemoryKeyValueStore();
    }

    get(id) {
        return this.keyValueStore.get(id);
    }

    getMany(ids) {
        return ids.map(this.get, this);
    }

    put(tweet) {
        return this.keyValueStore.put(tweet.id, tweet);
    }

    putMany(tweets) {
        return tweets.map(this.put, this);
    }
}

module.exports = TweetStore;

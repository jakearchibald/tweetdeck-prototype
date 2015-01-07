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
        return Promise.all(ids.map(this.get, this));
    }

    put(tweet) {
        return this.keyValueStore.put(tweet.id_str, tweet);
    }

    putMany(tweets) {
        return Promise.all(tweets.map(this.put, this));
    }
}

module.exports = TweetStore;

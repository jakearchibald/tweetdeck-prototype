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
        // TODO remember data about the request from which the tweet came
        return this.keyValueStore.put(tweet.id_str, tweet);
    }

    putRequestResult(requestResult) {
        return Promise.all(requestResult.result.map(this.put, this)).then(_ => requestResult);
    }
}

module.exports = TweetStore;

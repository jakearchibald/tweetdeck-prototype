class TweetStore {
    constructor(keyValueStore) {},

    getById(id) {
        return this.keyValueStore.getById(id);
    },

    getByIds(ids) {
        return ids.map(this.getById);
    },

    put(tweet) {
        return this.keyValueStore.put(tweet.id, tweet);
    },

    putMany(tweets) {
        return tweets.map(this.put);
    }
}

class TimelineStore {
    constructor(tweetStore, orderedStore, upstream) {},

    fetch(request) {
        // get requested range from store
        return this.orderedStore.fetch(request)
            .then(ids => this.idstore.getByIds(ids)) // throws if missing
            .catch(why => {
                return this.upstream.fetch(request.interval)
                    // get all tweets in requested range from tweetStore
                    .then(this.tweetStore.putMany)
                    .then(this.orderedStore.putMany)
                }
            )
    }
}


var idbTimelineStore = new TimelineStore({
    tweetStore   : idbTweetStore,
    orderedStore : idbOrderedStore,
    upstream     : apiClient
});

var memoryTimelineStore = new TimelineStore({
    tweetStore   : memoryTweetStore,
    orderedStore : memoryOrderedStore,
    upstream     : idbTimelineStore
});


- create real TweetStore and TimelineStore objects
- create memory ordered store implementation
- create memory key value store implementation
- pass timeline store to column with API upstream

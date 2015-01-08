var columnUtils = require('./columnutils');
var TimelineStore = require('../timeline-store');
var TweetColumnItem = require('./tweetcolumnitem');
var { Request } = require('../request-result');
var IDBKeyValueStore = require('../idb-key-value-store');
var TweetStore = require('../tweet-store');

class Column {
  constructor(type, account) {
    this.type = type;
    this.updating = false;
    this.title = columnUtils.getTitle(this.type);
    this.account = account;
    this.timelineStore = new TimelineStore({
      tweetStore: new TweetStore({
        keyValueStore: new IDBKeyValueStore()
      })
    });
    window.timelineStore = this.timelineStore;
  }

  load(opts={}) {
    return this.timelineStore
      .fetch(new Request(this.account, opts.cursor))
      .then(requestResult => {
        return {
          items: requestResult.result.map(data =>
            new TweetColumnItem(data)
          ),
          containsGap: requestResult.data.containsGap,
          cursors: requestResult.data.cursors
        };
      });
  }
}

module.exports = Column;

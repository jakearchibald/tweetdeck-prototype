var columnUtils = require('./columnutils');
var TweetStore = require('../tweet-store');

class Column {
  constructor(type, account) {
    this.type = type;
    this.updating = false;
    this.title = columnUtils.getTitle(this.type);
    this.account = account;
    this.tweetStore = new TweetStore();
  }

  load(opts={}) {
    return this.tweetStore
      .fetch({
        account: this.account,
        type: this.type,
        cursor: opts.cursor || {}
      })
      .then(items => items.sort(columnUtils.sort.byDate))
      .then(items => {
        return {
          items: items,
          // Got nothing back, must be the end
          exhausted: !items.length,
          cursors: {
            request: opts.cursor || {},
            up: columnUtils.cursor.up(items),
            down: columnUtils.cursor.down(items)
          }
        };
      });
  }
}

module.exports = Column;

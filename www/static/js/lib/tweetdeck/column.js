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
        query: opts.query
      })
      .then(data => {
        return {
          items: data.sort(columnUtils.sort.byDate),
          // Got nothing back, must be the end
          exhausted: !data.length
        };
      });
  }
}

module.exports = Column;

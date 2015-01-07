var columnUtils = require('./columnutils');
var TimelineStore = require('../timeline-store');
var TweetColumnItem = require('./tweetcolumnitem');

class Column {
  constructor(type, account) {
    this.type = type;
    this.updating = false;
    this.title = columnUtils.getTitle(this.type);
    this.account = account;
    this.timelineStore = new TimelineStore();
  }

  load(opts={}) {
    return this.timelineStore
      .fetch({
        account: this.account,
        type: this.type,
        cursor: opts.cursor || {}
      })
      .then(items =>
        items.map(data =>
          new TweetColumnItem(data)
        )
      )
      // TODO they *must* come sorted from the ordered store
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

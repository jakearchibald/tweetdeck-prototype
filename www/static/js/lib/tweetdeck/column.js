var Promise = require('rsvp').Promise;
var ColumnUtils = require('./columnutils');

function Column(key, columnData, feeds) {
  this.key = key;
  this.feeds = feeds;
  this.settings = columnData.settings;
  this.type = columnData.type;
  this.updating = false;
  this.items = [];

  var defaultTitle = ColumnUtils.getTitle(feeds[0].type);
  this.title = columnData.title || defaultTitle || "Unknown column title";
}

var ColumnProto = Column.prototype;

// resolves with new tweets
ColumnProto.loadMore = function() {
  this.updating = true;
  // TODO remove multi-feed capability to avoid missing tweets bug
  var lastId = this.items.length > 0 ? this.items[this.items.length - 1].id : null;
  return Promise
    .all(this.feeds.map(function (f) {
      return f.fetch(lastId);
    }))
    .then(function (columns) {
      this.updating = false;

      var previousLength = this.items.length;
      this.items = this.items.concat(columns.reduce(concat).sort(byDate));

      return {
        items: this.items,
        // Got nothing back, must be the end
        exhausted: (previousLength === this.items.length)
      };
    }.bind(this))
    .catch(function (err) {
      console.log('feed update error', err);
      throw err;
    });
};

function byDate(a, b) {
  return b.date - a.date;
}

function concat(a, b) {
  return a.concat(b);
}

module.exports = Column;

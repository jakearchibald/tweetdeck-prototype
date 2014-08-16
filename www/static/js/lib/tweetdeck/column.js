var Promise = require('rsvp').Promise;
var Tweet = require('./tweet');

function Column(key, columnData, feeds) {
  this.key = key;
  this.feeds = feeds;
  this.settings = columnData.settings;
  this.type = columnData.type;
  this.updating = false;
  this.items = [];

  // TODO: replace this with something better
  this.title = columnData.title || "Unknown column title";
}

var ColumnProto = Column.prototype;

// resolves with new tweets
ColumnProto.update = function() {
  this.updating = true;
  return Promise.all(
    this.feeds.map(function(f) { return f.fetch(); })
  ).then(function(columns) {
    this.updating = false;

    var columnItems;

    // move tweets into one ordered array
    if (!columns[1]) {
      columnItems = columns[0];
    }
    else {
      columnItems = columns.reduce(function(a, b) {
        return a.concat(b);
      });
    }

    this.items = columnItems.concat(this.items);

    return columnItems;
  }.bind(this)).catch(function(err) {
    console.log('feed update error', err);
    throw err;
  }.bind(this));
};

module.exports = Column;
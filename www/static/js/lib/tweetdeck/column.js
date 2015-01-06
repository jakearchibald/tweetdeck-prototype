var ColumnUtils = require('./columnutils');
var Feed = require('./feed');

function Column(type, account) {
  this.type = type;
  this.updating = false;
  this.items = [];
  this.title = ColumnUtils.getTitle(this.type);
  this.feed = new Feed(type, account);
}

var ColumnProto = Column.prototype;

// resolves with new tweets
ColumnProto.loadMore = function() {
  if (this.updating) {
    return Promise.reject(Error('Already updating.'));
  }
  this.updating = true;
  // TODO remove multi-feed capability to avoid missing tweets bug
  var lastId = this.items.length > 0 ? this.items[this.items.length - 1].id : null;
  return this.feed.fetch({
    query: {
      max_id: lastId
    }
  }).then(data => {
    this.updating = false;

    var previousLength = this.items.length;
    this.items = this.items.concat(data).sort(byDate);

    return {
      items: this.items,
      // Got nothing back, must be the end
      exhausted: (previousLength === this.items.length)
    };
  }).catch(err => {
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

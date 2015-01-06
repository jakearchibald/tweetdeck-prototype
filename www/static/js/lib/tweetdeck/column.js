var columnUtils = require('./columnutils');
var Feed = require('./feed');

function Column(type, account) {
  this.type = type;
  this.updating = false;
  this.title = columnUtils.getTitle(this.type);
  this.feed = new Feed(type, account);
}

var ColumnProto = Column.prototype;

// resolves with new tweets
ColumnProto.load = function (opts) {
  if (this.updating) {
    return Promise.reject(Error('Already updating.'));
  }
  opts = opts || {};
  this.updating = true;
  // TODO remove multi-feed capability to avoid missing tweets bug
  return this.feed.fetch({
    query: opts.query
  }).then(data => {
    this.updating = false;
    return {
      items: data.sort(columnUtils.sort.byDate),
      // Got nothing back, must be the end
      exhausted: !data.length
    };
  }).catch(err => {
    console.log('feed update error', err);
    throw err;
  });
};

module.exports = Column;

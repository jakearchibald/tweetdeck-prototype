var Promise = require('rsvp').Promise;
var Tweet = require('./tweet');

function Column(key, columnData, feeds) {
  this.key = key;
  this.feeds = feeds;
  this.settings = columnData.settings;
  this.type = columnData.type;
  this.updating = false;
  this.tweets = [];

  // TODO: replace this with something better
  this.title = columnData.title || "Unknown column title";
}

var ColumnProto = Column.prototype;

// resolves with new tweets
ColumnProto.update = function() {
  this.updating = true;
  return Promise.all(
    this.feeds.map(function(f) { return f.fetch(); })
  ).then(function(datas) {
    var newTweets;
    this.updating = false;

    // some feeds have tweets in .statuses
    datas = datas.map(function(data) {
      return data.statuses || data;
    });

    // move tweets into one ordered array
    if (!datas[1]) {
      newTweets = datas[0];
    }
    else {
      newTweets = datas.reduce(function(a, b) {
        return a.concat(b);
      }).sort(function(a, b) {
        return b.id - a.id;
      });
    }

    newTweets = newTweets.map(function(tweetData) {
      return new Tweet(tweetData);
    });

    this.tweets.unshift.apply(this.tweets, newTweets);

    return newTweets;
  }.bind(this)).catch(function(err) {
    console.log('feed update error', err);
    throw err;
  }.bind(this));
};

module.exports = Column;
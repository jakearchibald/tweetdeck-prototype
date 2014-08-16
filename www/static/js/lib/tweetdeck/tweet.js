var ColumnItem = require('./columnitem');

function Tweet(tweetData) {
  ColumnItem.call(this, tweetData);
}

var TweetProto = Tweet.prototype = Object.create(ColumnItem.prototype);

module.exports = Tweet;
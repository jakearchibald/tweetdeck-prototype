var utils = require('../utils');

function Tweet(tweetData) {
  this.id = tweetData.id;
  this.text = tweetData.text;
  this._buildTweetHTML();
}

var TweetProto = Tweet.prototype;

TweetProto._buildTweetHTML = function() {
  // TODO: entities
  this.html = utils.escapeHTML(this.text);
};

module.exports = Tweet;
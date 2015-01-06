var TwitterUser = require('./twitteruser');
var ColumnItem = require('./columnitem');
var tweetdeckUtils = require('./utils');

function TweetColumnItem(data) {
  ColumnItem.call(this);

  this.id = String(data.id);
  this.date = new Date(data.created_at);

  if (data.retweeted_status) {
    this.retweetedBy = new TwitterUser(data.user);
    this.user = new TwitterUser(data.retweeted_status.user);
    this._text = data.retweeted_status.text;
    this._entities = data.retweeted_status.entities;
  }
  else {
    // .sender if for DMs, may want to subclass this out
    this.user = new TwitterUser(data.user || data.sender);
    this._text = data.text;
    this._entities = data.entities;
  }

  this._html = undefined;
}

var TweetColumnItemProto = TweetColumnItem.prototype = Object.create(ColumnItem.prototype);

TweetColumnItemProto.getHTML = function() {
  if (this._html === undefined) {
    this._html = tweetdeckUtils.processEntities(this._text, this._entities);
  }
  return this._html;
};

module.exports = TweetColumnItem;
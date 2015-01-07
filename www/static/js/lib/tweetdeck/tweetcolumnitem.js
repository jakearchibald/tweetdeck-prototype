var TwitterUser = require('./twitteruser');
var ColumnItem = require('./columnitem');
var tweetdeckUtils = require('./utils');

class TweetColumnItem extends ColumnItem {
  constructor(data) {
    super();
    this.id = String(data.id);
    this.date = new Date(data.created_at);
    this.favouriteCount = data.favourite_count;
    this.retweetCount = data.retweet_count;

    var sourceTweet = data.retweeted_status || data;
    
    if (data.retweeted_status) {
      this.retweetedBy = new TwitterUser(data.user);
    }

    this.user = new TwitterUser(sourceTweet.user || sourceTweet.sender);
    this._text = sourceTweet.text;
    this._entities = sourceTweet.entities;
    this._html = undefined;

    if (sourceTweet.entities.media) {
      let photo = sourceTweet.entities.media.find(p => p.type = 'photo');
      if (photo) {
        this.heroImg = photo.media_url_https;
      }
    }
  }

  getHTML() {
    if (this._html === undefined) {
      this._html = tweetdeckUtils.processEntities(this._text, this._entities);
    }
    return this._html;
  }
}

module.exports = TweetColumnItem;
function Feed(key, feedData, account, proxy) {
  this.key = key;
  this.account = account;
  this.metadata = JSON.parse(feedData.metadata || '{}');
  this.type = feedData.type;
  this._proxy = proxy;
}

var FeedProto = Feed.prototype;

module.exports = Feed;
var TwitterUser = require('./twitteruser');
var TweetColumnItem = require('./tweetcolumnitem');

function FavouriteColumnItem(data) {
  TweetColumnItem.call(this.targets[0]);

  this.favouritedBy = new TwitterUser(data.sources[0]);
  this.id = this.id + '-fav-' + this.favouritedBy.id;
  this.date = new Date(data.created_at);
}

var FavouriteColumnItemProto = FavouriteColumnItem.prototype = Object.create(TweetColumnItem.prototype);

module.exports = FavouriteColumnItem;
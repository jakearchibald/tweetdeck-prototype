var TwitterUser = require('./twitteruser');
var ColumnItem = require('./columnitem');

function FollowColumnItem(data) {
  ColumnItem.call(this);

  this.id = data.id;
  this.date = new Date(data.created_at);

  this.followed = new TwitterUser(data.targets[0]);
  this.follower = new TwitterUser(data.sources[0]);
}

var FollowColumnItemProto = FollowColumnItem.prototype = Object.create(ColumnItem.prototype);

module.exports = FollowColumnItem;
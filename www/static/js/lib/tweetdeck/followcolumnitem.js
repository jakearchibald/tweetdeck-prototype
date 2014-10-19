var TwitterUser = require('./twitteruser');
var ColumnItem = require('./columnitem');

function FollowColumnItem(data) {
  ColumnItem.call(this);
  var followedData = data.targets[0];
  var followerData = data.sources[0];

  this.id = followerData.id + '-followed-' + followedData.id;
  this.date = new Date(data.created_at);

  this.followed = new TwitterUser(followedData);
  this.follower = new TwitterUser(followerData);
}

var FollowColumnItemProto = FollowColumnItem.prototype = Object.create(ColumnItem.prototype);

module.exports = FollowColumnItem;
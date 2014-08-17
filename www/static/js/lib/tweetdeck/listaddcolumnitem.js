var TwitterUser = require('./twitteruser');
var ColumnItem = require('./columnitem');

function ListAddColumnItem(data) {
  ColumnItem.call(this);
  var listData = data.target_objects[0];
  var userAddedData = data.targets[0];
  var adderData = data.sources[0];

  this.id = listData.id + '-added-' + userAddedData.id;
  this.date = new Date(data.created_at);

  this.added = new TwitterUser(userAddedData);
  this.adder = new TwitterUser(adderData);

  // TODO list object
}

var ListAddColumnItemProto = ListAddColumnItem.prototype = Object.create(ColumnItem.prototype);

module.exports = ListAddColumnItem;
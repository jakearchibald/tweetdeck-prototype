var TwitterUser = require('./user');
var utils = require('../utils');

function ColumnItem() {
  this.id = '';
  this.date = null;
}

var ColumnItemProto = ColumnItem.prototype;

module.exports = ColumnItem;

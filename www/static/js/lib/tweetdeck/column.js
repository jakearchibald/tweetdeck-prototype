function Column(key, columnData, feeds) {
  this.key = key;
  this.feeds = feeds;
  this.settings = columnData.settings;
  this.type = columnData.type;
  this.title = columnData.title || "Unknown column title";
}

var ColumnProto = Column.prototype;

module.exports = Column;
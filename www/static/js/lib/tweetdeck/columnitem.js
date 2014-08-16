var TwitterUser = require('./user');
var utils = require('../utils');

function ColumnItem(data) {
  this.id = data.id;
  this.date = new Date(data.created_at);

  if (this.user) { // TODO: don't need this check once using correct subclass
    this.user = new TwitterUser(data.user);
  }

  this._text = data.text || "NO TEXT IT WENT WRONG";
  this._entities = data.entities;

  this.html = this._buildHTML();
}

var ColumnItemProto = ColumnItem.prototype;

ColumnItemProto._buildHTML = function() {
  var entities = [];

  for (var type in this._entities) {
    this._entities[type].forEach(function(entity) {
      entity.entity_type = type;
      entities.push(entity);
    });
  }

  entities = entities.sort(function(a, b) {
    return a.indices[0] - b.indices[0];
  });

  var pos = 0;
  var html = entities.reduce(function(html, entity) {
    // process previous non-entity content
    if (entity.indices[0] != pos) {
      html += utils.escapeHTML(this._text.slice(pos, entity.indices[0]));
    }
    // process entity content
    switch (entity.entity_type) {
      case "user_mentions":
        var escapedScreenName = utils.escapeHTML(entity.screen_name);
        html += '<a href="//twitter.com/' + escapedScreenName + '/">@' + escapedScreenName + '</a>';
        break;
      case "hashtags":
        var escapedTag = utils.escapeHTML(entity.text);
        html += '<a href="//twitter.com/search?q=%23' + escapedTag + '/">#' + escapedTag + '</a>';
        break;
      case "media":
      case "urls":
        html += '<a href="' + utils.escapeHTML(entity.url) + '">' + utils.escapeHTML(entity.display_url) + '</a>';
        break;
      default:
        html += utils.escapeHTML(this._text.slice(entity.indices[0], entity.indices[1]));
    }
    pos = entity.indices[1];
    return html;
  }.bind(this), '');

  // and the rest
  if (pos != this._text.length) {
    html += utils.escapeHTML(this._text.slice(pos));
  }

  return html;
};

module.exports = ColumnItem;
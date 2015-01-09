var utils = require('../utils.js');

exports.processEntities = function processEntities(text, entitiesMap) {
  var entities = [];

  for (var type in entitiesMap) {
    entitiesMap[type].forEach(function(entity) {
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
      html += text.slice(pos, entity.indices[0]);
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
        html += utils.escapeHTML(text.slice(entity.indices[0], entity.indices[1]));
    }
    pos = entity.indices[1];
    return html;
  }, '');

  // and the rest
  if (text && pos != text.length) {
    html += text.slice(pos);
  }

  return html;
};
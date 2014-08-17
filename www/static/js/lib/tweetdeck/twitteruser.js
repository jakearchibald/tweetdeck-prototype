var tweetdeckUtils = require('./utils');

function TwitterUser(data) {
  this.name = data.name;
  this.screenName = data.screen_name;
  this.avatar = data.profile_image_url_https;
  this.protected = data.protected;
  this.twitterURL = 'https://twitter.com/' + this.screenName;
  this._description = data.description;
  this._descriptionEntities = data.entities.description;
  this._descriptionHTML = undefined;
}

var TwitterUserProto = TwitterUser.prototype;

TwitterUserProto.getDescriptionHTML = function() {
  if (this._descriptionHTML === undefined) {
    this._descriptionHTML = tweetdeckUtils.processEntities(this._description, this._descriptionEntities);
  }
  return this._descriptionHTML;
};

module.exports = TwitterUser;
function TwitterUser(data) {
  this.name = data.name;
  this.screenName = data.screen_name;
  this.avatar = data.profile_image_url_https;
  this.protected = data.protected;
  this.twitterURL = 'https://twitter.com/' + this.screenName;
}

var TwitterUserProto = TwitterUser.prototype;

module.exports = TwitterUser;
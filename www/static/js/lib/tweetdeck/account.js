var utils = require('../utils');

function Account(rawData, proxy) {
  this.name = rawData.name;
  this.screenName = rawData.screen_name;
  this.id = rawData.uid;
  this.avatar = rawData.avatar;
  this.default = rawData.default;
  this.oauth = {
    token: rawData.key,
    secret: rawData.secret
  };
  this._proxy = proxy;
}

var AccountProto = Account.prototype;

AccountProto.proxiedRequest = function(url, opts) {
  opts = utils.defaults(opts, {
    headers: {}
  });
  opts.headers['x-td-oauth-key'] = this.oauth.token;
  opts.headers['x-td-oauth-secret'] = this.oauth.secret;
  return fetch(this._proxy + '/oauth/proxy/twitter/' + encodeURIComponent(url), opts);
};

module.exports = Account;
/*
TD.proxiedRequest = function (account, url, opts) {
  opts = utils.defaults(opts, {
    headers: {}
  });
  opts.headers['x-td-oauth-key'] = account.oauth.token;
  opts.headers['x-td-oauth-secret'] = account.oauth.secret;
  return fetch(this.proxy + '/oauth/proxy/twitter/' + encodeURIComponent(url), opts);
};
*/


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
}

var AccountProto = Account.prototype;

module.exports = Account;
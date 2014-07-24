'use strict';

var Promise = require('rsvp').Promise;
var fetch = require('./fetch');
var utils = require('./utils');

/**
 * Private utils
 */

function basicAuthHeader(user, passhash) {
  return 'x-td-basic ' + btoa(user + ':' + passhash);
}

function sessionHeader(token) {
  return 'X-TD-Session ' + token;
}

/**
 * TweetDeck API
 */
module.exports = TweetDeck;
function TweetDeck(opts) {
  utils.defaults(opts, {
    proxy: '//localhost:1234'
  });

  this.proxy = opts.proxy;
}

var TD = TweetDeck.prototype;

TD.authorizedRequest = function (user, path, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers['Authorization'] = sessionHeader(user.session);
  return fetch(this.proxy + path, opts);
};

TD.proxiedRequest = function (account, url, opts) {
  utils.defaults(opts, {
    headers: {}
  });
  opts.headers['x-td-oauth-key'] = account.oauth.token;
  opts.headers['x-td-oauth-secret'] = account.oauth.secret;
  return fetch(this.proxy + '/oauth/proxy/twitter/' + encodeURIComponent(url), opts);
};

/**
 * Login
 */

TD.login = function (username, password) {
  return fetch(this.proxy + '/login', {
    headers: {
      'Authorization': basicAuthHeader(username, password),
      'X-TD-Authtype': 'twitter'
    }
  });
};

/**
 * Data
 */

TD.getRawEverything = function (user) {
  return tweetdeck.authorizedRequest(user, '/clients/blackbird/all');
};

/**
 * Accounts
 */

TD.getRawAccounts = function (user) {
  return _tweetdeck.getRawEverything(user)
    .then(function (tdData) {
      return tdData.accounts;
    });
};

TD.transformRawAccount = function (rawAccount) {
  return {
    name: rawAccount.name,
    screenName: rawAccount.screen_name,
    id: rawAccount.uid,
    avatar: rawAccount.avatar,
    default: rawAccount.default,
    oauth: {
      token: rawAccount.key,
      secret: rawAccount.secret
    }
  };
};

TD.getAccounts = function (user) {
  return _tweetdeck.getRawAccounts(user)
    .then(function (accounts) {
      return accounts.map(_tweetdeck.transformRawAccount);
    });
};

/**
 * Columns
 */

TD.getRawColumns = function (user) {
  return _tweetdeck.getRawEverything(user)
    .then(function (tdData) {
      return tdData.columns;
    });
};

TD.transformRawColumn = function (columnKey, rawColumn, feeds) {
  return {
    key: columnKey,
    feeds: feeds,
    settings: rawColumn.settings,
    type: rawColumn.type
  };
};

TD.getColumns = function (user) {
  return Promise.all([_tweetdeck.getRawColumns(user), tweetdeck.getFeeds(user)])
    .then(function (res) {
      var columns = res[0];
      var feeds = res[1];
      return Object.keys(columns).map(function (columnKey) {
        var rawColumn = columns[columnKey];
        return _tweetdeck.transformRawColumn(
          columnKey,
          rawColumn,
          feeds.filter(function (feed) {
            return (rawColumn.feeds.indexOf(feed.key) > -1);
          })
        );
      });
    });
};

/**
 * Feeds
 */

TD.getRawFeeds = function (user) {
  return _tweetdeck.getRawEverything(user)
    .then(function (tdData) {
      return tdData.feeds;
    });
};

TD.transformRawFeed = function (feedKey, rawFeed) {
  return {
    key: feedKey,
    user: rawFeed.account.userid,
    metadata: JSON.parse(rawFeed.metadata || '{}'),
    type: rawFeed.type
  };
};

TD.getFeeds = function (user) {
  return _tweetdeck.getRawFeeds(user)
    .then(function (feeds) {
      return Object.keys(feeds).map(function (feedKey) {
        return _tweetdeck.transformRawFeed(feedKey, feeds[feedKey]);
      });
    });
};

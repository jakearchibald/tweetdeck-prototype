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
function TweetDeck(opts) {
  opts = utils.defaults(opts, {
    proxy: '//localhost:3001'
  });

  this.proxy = opts.proxy;
  this._pIntialFetch = this.resetInitialFetch();
}

var TD = TweetDeck.prototype;

TD.authorizedRequest = function (user, path, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers['Authorization'] = sessionHeader(user.session);
  return fetch(this.proxy + path, opts);
};

TD.proxiedRequest = function (account, url, opts) {
  opts = utils.defaults(opts, {
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
    },
    type: 'json'
  });
};

/**
 * Data
 */

TD.initialFetch = function (user /*, force? */) {
  return this.getInitialFetchForUser(user);
};

TD.getRawEverything = function (user) {
  return this.authorizedRequest(user, '/clients/blackbird/all', {
    type: 'json'
  });
};

TD.getInitialFetchForUser = function (user) {
  if (this._initialFetchUser !== user) {
    this._pIntialFetch = this.resetInitialFetch();
    this._initialFetchUser = user;
    this.getRawEverything(user)
      .then(
        this._resolveInitialFetch.bind(this),
        this._rejectInitialFetch.bind(this)
      );
  }
  return this._pIntialFetch;
};

TD.resetInitialFetch = function () {
  delete this._resolveInitialFetch;
  delete this._rejectInitialFetch;
  return new Promise(function (resolve, reject) {
    this._resolveInitialFetch = resolve;
    this._rejectInitialFetch = reject;
  }.bind(this));
};

/**
 * Metadata
 */

TD.getRawMetadata = function (user) {
  return this.initialFetch(user)
    .then(function (tdData) {
      return tdData.client;
    });
};

TD.transformRawMetadata = function (rawMetadata) {
  return {
    columnOrder: rawMetadata.columns,
    defaultAccount: rawMetadata.default_account.replace('twitter:', ''),
    recentSearches: rawMetadata.recent_searches,
  }
};

TD.getMetadata = function (user) {
  return this.getRawMetadata(user)
    .then(this.transformRawMetadata.bind(this));
};

/**
 * Accounts
 */

TD.getRawAccounts = function (user) {
  return this.initialFetch(user)
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
  return this.getRawAccounts(user)
    .then(function (accounts) {
      return accounts.map(this.transformRawAccount);
    }.bind(this));
};

/**
 * Columns
 */

TD.getRawColumns = function (user) {
  return this.initialFetch(user)
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
  return Promise.all([this.getRawColumns(user), this.getFeeds(user)])
    .then(function (res) {
      var columns = res[0];
      var feeds = res[1];
      return Object.keys(columns).map(function (columnKey) {
        var rawColumn = columns[columnKey];
        return this.transformRawColumn(
          columnKey,
          rawColumn,
          feeds.filter(function (feed) {
            return (rawColumn.feeds.indexOf(feed.key) > -1);
          })
        );
      }, this);
    }.bind(this));
};

/**
 * Feeds
 */

TD.getRawFeeds = function (user) {
  return this.initialFetch(user)
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
  return this.getRawFeeds(user)
    .then(function (feeds) {
      return Object.keys(feeds).map(function (feedKey) {
        return this.transformRawFeed(feedKey, feeds[feedKey]);
      }, this);
    }.bind(this));
};

module.exports = new TweetDeck();

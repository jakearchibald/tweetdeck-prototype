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
    proxy: '//localhost:8001'
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
  }).then(this.transformLoginResponse);
};

TD.verifyTwoFactor = function (opts) {
  var body = {
    login_verification_request_id: opts.requestId,
    login_verification_user_id: '' + opts.userId,
    login_verification_challenge_response: opts.code
  };

  return fetch(this.proxy + '/login', {
    method: 'POST',
    headers: {
      'X-TD-Authtype': 'twitter'
    },
    body: JSON.stringify(body),
    type: 'json'
  });
};

TD.transformLoginResponse = function (res) {
  if (res.screen_name) {
    return {
      screenName: res.screen_name,
      userId: res.user_id,
      session: res.session
    }
  }

  var response = {
    raw: res,
    error: res.error,
    upstreamStatus: res.upstream_http_code
  }

  if (res.xauth_response) {
    if(res.xauth_response.login_verification_request_cause) {
      response.twoFactorChallenge = {
        viaSMSCode: (res.xauth_response.login_verification_request_type === 1),
        viaMobileApp: (res.xauth_response.login_verification_request_type === 2),
        requestId: res.xauth_response.login_verification_request_id,
        userId: res.xauth_response.login_verification_user_id
      }
    }
    if (res.xauth_response.errors && res.xauth_response.errors.length > 0) {
      response.xAuthError = {
        code: res.xauth_response.errors[0].code,
        message: res.xauth_response.errors[0].message
      }
    }
  }

  return response;
}

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
    this._initialFetchUser = user;
    this._pIntialFetch = this.getRawEverything(user);
  }
  return this._pIntialFetch;
};

TD.resetInitialFetch = function () {
  return Promise.reject(Error("No data fetched"));
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
    recentSearches: rawMetadata.recent_searches
  };
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
    type: rawColumn.type,
    title: rawColumn.title || "Unknown column title"
  };
};

TD.getColumns = function (user) {
  return Promise.all([
    this.getRawColumns(user),
    this.getFeeds(user),
    this.getMetadata(user)
  ])
    .then(function (res) {
      var columns = res[0];
      var feeds = res[1];
      var metaData = res[2];
      return metaData.columnOrder.map(function (columnKey) {
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

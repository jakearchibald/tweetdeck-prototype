'use strict';

var Promise = require('rsvp').Promise;
var fetch = require('../fetch');
var utils = require('../utils');
var User = require('./User');
var Account = require('./Account');
var Column = require('./Column');
var Feed = require('./Feed');

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
    proxy: '//' + window.location.hostname + ':8001'
  });

  this.proxy = opts.proxy;
  this.user = null;
  this.columns = null;
  this.accounts = null;
  this.metadata = null;
  this.resetInitialFetch();
}

var TD = TweetDeck.prototype;

TD._authorizedRequest = function (path, opts) {
  if (!this.user) {
    return Promise.reject(Error("Not logged in"));
  }
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers['Authorization'] = sessionHeader(this.user.session);
  return fetch(this.proxy + path, opts);
};

/**
 * Login
 */

TD.setUser = function(user) {
  this.user = user;
};

TD.login = function (username, password) {
  return fetch(this.proxy + '/login', {
    headers: {
      'Authorization': basicAuthHeader(username, password),
      'X-TD-Authtype': 'twitter'
    },
    type: 'json'
  }).then(this._transformLoginResponse.bind(this));
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
  }).then(this._transformLoginResponse.bind(this));
};

TD._transformLoginResponse = function (res) {
  if (res.screen_name) {
    this.user = new User({
      screenName: res.screen_name,
      id: res.user_id,
      session: res.session
    });
    return this.user;
  }

  var response = {
    raw: res,
    error: res.error,
    upstreamStatus: res.upstream_http_code
  };

  if (res.xauth_response) {
    if(res.xauth_response.login_verification_request_cause) {
      response.twoFactorChallenge = {
        viaSMSCode: (res.xauth_response.login_verification_request_type === 1),
        viaMobileApp: (res.xauth_response.login_verification_request_type === 2),
        requestId: res.xauth_response.login_verification_request_id,
        userId: res.xauth_response.login_verification_user_id
      };
    }
    if (res.xauth_response.errors && res.xauth_response.errors.length > 0) {
      response.xAuthError = res.xauth_response.errors[0];

      // Add 2FA errors into 2FA data
      if (response.xAuthError.code === 236) { // Incorrect SMS Code
        response.twoFactorChallenge = {
          viaSMSCode: true,
          error: response.xAuthError
        };
      }
      if (response.xAuthError.code === 253) { // Waiting for mobile app auth
        response.twoFactorChallenge = {
          viaMobileApp: true,
          error: response.xAuthError
        };
      }
    }
  }

  return response;
};

/**
 * Data
 */

TD.initialFetch = function () {
  if (this._initialFetchUser !== this.user) {
    this._initialFetchUser = this.user;
    this._pIntialFetch = this._fetchRawEverything();
  }
  return this._pIntialFetch;
};

TD._fetchRawEverything = function () {
  return this._authorizedRequest('/clients/blackbird/all', {
    type: 'json'
  }).then(this._processRawData.bind(this));
};

TD.resetInitialFetch = function () {
  this._pIntialFetch = Promise.reject(Error("No data fetched"));
};

TD._processRawData = function(rawData) {
  if (rawData.error) {
    throw Error(rawData.error);
  }

  this.metadata = {
    recentSearches: rawData.client.recent_searches
  };

  var accountsByID = {};
  this.accounts = [];

  rawData.accounts.forEach(function(accountData) {
    var account = new Account(accountData, this.proxy);
    accountsByID[account.id] = account;
    this.accounts.push(account);
  }.bind(this));

  var feedsByID = {};

  Object.keys(rawData.feeds).forEach(function(feedKey) {
    var feedData = rawData.feeds[feedKey];
    var account = accountsByID[feedData.account.userid];
    var feed = new Feed(feedKey, feedData, account, this.proxy);

    feedsByID[feed.key] = feed;
  }.bind(this));

  this.columns = rawData.client.columns.map(function(columnID) {
    var columnData = rawData.columns[columnID];
    var feeds = columnData.feeds.map(function(feedID) {
      return feedsByID[feedID];
    });

    return new Column(columnID, columnData, feeds);
  }.bind(this));
};

module.exports = new TweetDeck();

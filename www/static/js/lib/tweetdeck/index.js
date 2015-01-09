'use strict';

var utils = require('../utils');
var Promise = require('../promise');
var User = require('./user');
var makeAccount = require('./account');
var Column = require('./column');

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
  this.fetchAccountDone = false;
}

var TD = TweetDeck.prototype;

TD.authorizedRequest = function (user, path, opts) {
  if (!user) {
    return Promise.reject(Error("Not logged in"));
  }
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers['Authorization'] = sessionHeader(user.session);
  return fetch(this.proxy + path, opts);
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
  })
  .then(r => r.json())
  .then(this.transformLoginResponse.bind(this));
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
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(this.transformLoginResponse.bind(this));
};

TD.transformLoginResponse = function (res) {
  if (res.screen_name) {
    return new User({
      screenName: res.screen_name,
      id: res.user_id,
      session: res.session
    });
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

TD.fetchAccount = function (user) {
  if (!this.fetchAccountDone) {
    this.fetchAccountDone = true;
    this.pAccount = this.fetchAndExtractAccountForUser(user);
  }
  return this.pAccount;
};

TD.fetchAndExtractAccountForUser = function (user) {
  return this.authorizedRequest(user, '/clients/blackbird/all')
    .then(r => r.json())
    .then(this.extractAccountForUser.bind(this, user));
};

TD.extractAccountForUser = function (user, rawData) {
  if (rawData.error) {
    throw Error(rawData.error);
  }

  // Only keep the sign-in account
  var rawAccount = rawData.accounts.find(account => account.uid === user.id);
  return makeAccount(rawAccount);
};

module.exports = new TweetDeck();

/**
 * TweetDeck API
 */
var Promise = require('rsvp').Promise;
var fetch = require('./fetch');
var IndexedDouchebag = require('./indexeddouchebag');

function basicAuthHeader(user, password) {
  return 'x-td-basic ' + btoa(user + ':' + password);
}

function sessionHeader(token) {
  return 'X-TD-Session ' + token;
}

function Tweetdeck(origin) {
  this.proxy = origin;
  this.initialData = null;
  if (IndexedDouchebag.supported) {
    this.idb = new IndexedDouchebag('tweetdeck', 1, function(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('keyval');
      }
    });
    this.authToken = this.idb.get('keyval', 'session').catch(function(){});
  }
  else {
    this.authToken = Promise.resolve(localStorage.getItem('session') || "");
  }
}

var TweetdeckProto = Tweetdeck.prototype;

TweetdeckProto.authorizedRequest = function(path, opts) {
  var tweetdeck = this;
  opts = opts || {};
  opts.headers = opts.headers || {};

  return this.authToken.then(function(authToken) {
    if (!authToken) {
      throw Error("NoSession");
    }
    opts.headers['Authorization'] = sessionHeader(authToken);
    return fetch(tweetdeck.proxy + path, opts).then(function(data) {
      if (data.error) {
        throw Error(data.error);
      }
      return data;
    });
  });
};

TweetdeckProto.login = function(username, password) {
  var thisTweetdeck = this;

  return fetch(this.proxy + '/login', {
    headers: {
      'Authorization': basicAuthHeader(username, password),
      'X-TD-Authtype': 'twitter'
    },
    type: 'json'
  }).then(function(result) {
    if (!result.session) {
      throw Error("Login Failure");
    }
    thisTweetdeck.authToken = Promise.resolve(result.session);
    if (thisTweetdeck.idb) {
      thisTweetdeck.idb.put('keyval', 'session', result.session);
    }
    else {
      localStorage.setItem('session', result.session);
    }
  });
};

TweetdeckProto.fetchInitialData = function(user) {
  var thisTweetdeck = this;
  // window.initialPrefetch is set in the head of the document
  var initialPrefetch = window.initialPrefetch || Promise.reject();

  return initialPrefetch.then(function(response) {
    if (response.error) {
      throw Error(response.error);
    }
    window.initialPrefetch = null;
    return response;
  }).catch(function() {
    console.log('failed prefetch');
    return thisTweetdeck.authorizedRequest('/clients/blackbird/all', {
      type: 'json'
    }).then(function(data) {
      thisTweetdeck.initialData = data;
      return data;
    });
  });
};

module.exports = Tweetdeck;
var utils = require('./utils');
var _ = require('lodash');
var { RequestResult } = require('./request-result');

function wrapRequestWithResult(request) {
  return (result => new RequestResult(request, result));
}

function extendAndClean(o, ...objs) {
  return objs
    .reduce((memo, obj) => {
      return memo.extend(obj);
    }, _.chain(o).clone())
    // Only keep truthy values
    .pick(function (value) {
      return (typeof value !== 'undefined' && value !== null);
    })
    .value();
}

var TWITTER = {
  BASE: 'https://api.twitter.com',
  PROXY: '//' + window.location.hostname + ':8001',
  ENDPOINTS: {
    home: {
      url: '/1.1/statuses/home_timeline.json',
      query: {
        count: 200
      }
    },
    favorite: {
      opts: {
        method: 'POST',
      },
      url: '/1.1/favorites/create.json',
      query: {}
    },
    retweet: {
      opts: {
        method: 'POST',
      },
      url: '/1.1/statuses/retweet/{id}.json',
      query: {}
    }
  },
  DEFAULT_QUERY: {
    include_my_retweets: 1,
    include_entities: 1,
    include_cards: 1,
    send_error_codes: 1,
    include_user_entities: 1
  }
};

module.exports = {
  proxiedRequest(account, url, opts) {
    opts = utils.defaults(opts, {
      headers: {}
    });
    opts.headers['x-td-oauth-key'] = account.oauth.token;
    opts.headers['x-td-oauth-secret'] = account.oauth.secret;
    return fetch(TWITTER.PROXY + '/oauth/proxy/twitter/' + encodeURIComponent(url), opts);
  },

  makeRequest(endpointKey, request={}) {
    const endpoint = TWITTER.ENDPOINTS[endpointKey];
    if (!endpoint) {
      throw Error(`No such endpoint: ${endpointKey}`);
    }
    const query = extendAndClean(
      endpoint.query || {},
      request.cursor.query,
      TWITTER.DEFAULT_QUERY
    );
    const params = extendAndClean(
      endpoint.params || {},
      request.cursor.params || {},
      TWITTER.DEFAULT_PARAMS
    );
    const url = `${TWITTER.BASE}${utils.templateString(endpoint.url, params)}` +
                `?${utils.objToQueryString(query)}`;

    return this.proxiedRequest(request.account, url, endpoint.opts || {})
      .then(r => r.json());
  },

  fetch(request={}) {
    return this.makeRequest('home', request)
      .then(result => result.filter(t => !t.in_reply_to_screen_name))
      .then(wrapRequestWithResult(request));
  },

  favoriteTweet(request) {
    return this.makeRequest('favorite', request)
      .then(wrapRequestWithResult(request));
  },

  retweetTweet(request) {
    return this.makeRequest('retweet', request)
      .then(wrapRequestWithResult(request));
  }
}

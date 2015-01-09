var utils = require('./utils');
var _ = require('lodash');
var { RequestResult } = require('./request-result');

function wrapRequestWithResult(request) {
  return (result => new RequestResult(request, result));
}

var TWITTER = {
  BASE: 'https://api.twitter.com',
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
  makeRequest(endpointKey, request={}) {
    const endpoint = TWITTER.ENDPOINTS[endpointKey];
    if (!endpoint) {
      throw Error(`No such endpoint: ${endpointKey}`);
    }
    const query = _.chain(endpoint.query || {})
      .clone()
      .extend(request.cursor.query || {})
      .extend(TWITTER.DEFAULT_QUERY)
      // Only keep truthy values
      .pick(function (value) {
        return (typeof value !== 'undefined' && value !== null);
      })
      .value();

    const url = TWITTER.BASE + endpoint.url + '?' + utils.objToUrlParams(query);

    return request.account.proxiedRequest(url, endpoint.opts || {})
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
  }
}

var utils = require('../utils');
var _ = require('lodash');

var TWITTER = {
  BASE: 'https://api.twitter.com',
  ENDPOINTS: {
    home: {
      url: '/1.1/statuses/home_timeline.json',
      query: {
        count: 200,
        include_my_retweets: 1,
        include_entities: 1,
        include_cards: 1,
        send_error_codes: 1,
        include_user_entities: 1
      }
    },
    mentions: {
      url: '/1.1/statuses/mentions_timeline.json',
      query: {
        count: 200,
        include_my_retweets: 1,
        include_entities: 1,
        include_cards: 1,
        send_error_codes: 1,
        include_user_entities: 1
      }
    }
  }
};

module.exports = {
  fetch(opts={}) {
    const endpoint = TWITTER.ENDPOINTS[opts.type];
    const query = _.chain(endpoint.query || {})
      .clone()
      .extend(opts.cursor.query || {})
      // Only keep truthy values
      .pick(function (value) {
        return (typeof value !== 'undefined' && value !== null);
      })
      .value();

    const url = TWITTER.BASE + endpoint.url + '?' + utils.objToUrlParams(query);

    return opts.account.proxiedRequest(url).then(r => r.json());
  }
}

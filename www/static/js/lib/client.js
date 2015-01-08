var utils = require('./utils');
var _ = require('lodash');
var { RequestResult } = require('./request-result');

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
  fetch(request={}) {
    const endpoint = TWITTER.ENDPOINTS.home;
    const query = _.chain(endpoint.query || {})
      .clone()
      .extend(request.cursor.query || {})
      // Only keep truthy values
      .pick(function (value) {
        return (typeof value !== 'undefined' && value !== null);
      })
      .value();

    const url = TWITTER.BASE + endpoint.url + '?' + utils.objToUrlParams(query);

    return request.account.proxiedRequest(url)
      .then(r => r.json())
      .then(result => result.filter(t => !t.in_reply_to_screen_name))
      .then(result => {
        return new RequestResult(request, result);
      });
  },

  favoriteTweet(tweet) {
    console.log('== client.favoriteTweet ========================');
    console.log('tweet', tweet);
    return Promise.resolve(tweet);
  }
}

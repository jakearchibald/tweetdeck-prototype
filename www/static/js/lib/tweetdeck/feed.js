var utils = require('../utils');
var TweetColumnItem = require('./tweetcolumnitem');

function Feed(type, account) {
  this.type = type;
  this.account = account;
}

var FeedProto = Feed.prototype;

FeedProto.fetch = function(maxId) {
  var endpoint = this._getEndpoint();

  endpoint.opts.since_id = 1;
  if (maxId) {
    endpoint.opts.max_id = maxId;
  }

  var url = endpoint.url + '?' + utils.objToUrlParams(endpoint.opts);

  return this.account.proxiedRequest(url).then(r => r.json()).then(function(datas) {
    // search feeds have tweets in .statuses
    datas = datas.statuses || datas;

    return datas.filter(function(data) {
      if (data.action == 'follow' || data.action == 'list_member_added') {
        return false;
      }
      return true;
    }).map(function(data) {
      if (this.type == "interactions" || this.type == "networkactivity") {
        switch (data.action) {
          case "mention":
            return new TweetColumnItem(data.target_objects[0]);
          default:
            return new TweetColumnItem(data.targets[0]);
        }
      }
      return new TweetColumnItem(data);
    }.bind(this));
  }.bind(this));
};

FeedProto._getEndpoint = function() {
  switch(this.type) {
    case "home":
      return {
        url: "https://api.twitter.com/1.1/statuses/home_timeline.json",
        opts: {
          count: 200,
          include_my_retweets: 1,
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1
        }
      };
    case "mentions":
      return {
        url: "https://api.twitter.com/1.1/statuses/mentions_timeline.json",
        opts: {
          count: 200,
          include_my_retweets: 1,
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1
        }
      };

    throw Error('Unknown feed type');
  }
};

module.exports = Feed;

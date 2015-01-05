var utils = require('../utils');
var TweetColumnItem = require('./tweetcolumnitem');

function Feed(key, feedData, account, proxy) {
  this.key = key;
  this.account = account;
  this.metadata = JSON.parse(feedData.metadata || '{}');
  this.type = feedData.type;
  this._proxy = proxy;
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
    case "interactions":
      return {
        url: "https://api.twitter.com/1.1/activity/about_me.json",
        opts: {
          count: 200,
          skip_aggregation: "true",
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1
        }
      };
    case "search":
      return {
        url: "https://api.twitter.com/1.1/search/tweets.json",
        opts: {
          q: this.metadata.baseQuery,
          result_type: "recent",
          count: 200,
          skip_aggregation: "true",
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1
        }
      };
    case "direct":
      // TODO: looks like DMs are a special case, they are displayed differently
      return {
        url: "https://api.twitter.com/1.1/direct_messages.json",
        // and "https://api.twitter.com/1.1/direct_messages/sent.json"?
        opts: {
          count: 200,
          include_my_retweets: 1,
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1
        }
      };
    case "usertweets":
      return {
        url: "https://api.twitter.com/1.1/statuses/user_timeline.json",
        opts: {
          count: 200,
          include_my_retweets: 1,
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1,
          include_rts: 1
        }
      };
    case "list":
      return {
        url: "https://api.twitter.com/1.1/lists/statuses.json",
        opts: {
          list_id: this.metadata.listId,
          count: 200,
          include_my_retweets: 1,
          include_entities: 1,
          include_cards: 1,
          send_error_codes: 1,
          include_user_entities: 1,
          include_rts: 1
        }
      };
    case "networkactivity":
      return {
        url: "https://api.twitter.com/1.1/activity/by_friends.json",
        opts: {
          count: 200,
          skip_aggregation: "true",
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
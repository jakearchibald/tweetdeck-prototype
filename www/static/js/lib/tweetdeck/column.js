const columnUtils = require('./columnutils');
const TimelineStore = require('../timeline-store');
const { Request } = require('../request-result');
const TwitterUser = require('./twitteruser');
const Immutable = require('immutable');

function normalizeTweetData(data) {
  const sourceTweet = data.retweeted_status || data;
  const photo = sourceTweet.entities.media ?
      sourceTweet.entities.media.find(p => p.type = 'photo') :
      null;

  const record = {
    id: String(data.id_str),
    date: new Date(data.created_at),
    favouriteCount: data.favorite_count,
    retweetCount: data.retweet_count,
    heroImg: photo ? photo.media_url_https : null
  };

  if (data.retweeted_status) {
    return Object.assign(record, {
      user: new TwitterUser(data.retweeted_status.user),
      retweetedBy: new TwitterUser(data.user),
      text: data.retweeted_status.text,
      entities: data.retweeted_status.entities,
    });
  } else {
    return Object.assign(record, {
      // .sender for DMs
      user: new TwitterUser(data.user || data.sender),
      text: data.text,
      entities: data.entities
    });
  }
}

class Column {
  constructor(type, account) {
    this.type = type;
    this.updating = false;
    this.title = columnUtils.getTitle(this.type);
    this.account = account;
    this.timelineStore = new TimelineStore();
    window.timelineStore = this.timelineStore;
  }

  load(opts={}) {
    return this.timelineStore
      .fetch(new Request(this.account, opts.cursor))
      .then(requestResult => {
        const items = Immutable.OrderedMap(
            requestResult.result
              .map(normalizeTweetData)
              .map(i => [i.id, i]));
        return {
          items: items,
          exhausted: false,
          cursors: requestResult.data.cursors
        };
      })
  }
}

module.exports = Column;

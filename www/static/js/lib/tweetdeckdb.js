var IndexedDouchebag = require('./indexeddouchebag');
var Promise = require('rsvp').Promise;

function TweetdeckDb() {
  if (IndexedDouchebag.supported) {
    this.idb = new IndexedDouchebag('tweetdeck', 1, function(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('keyval');
      }
    });
  }
}

var TweetdeckDbProto = TweetdeckDb.prototype;

TweetdeckDbProto.getUser = function() {
  if (IndexedDouchebag.supported) {
    return this.idb.get('keyval', 'user');
  }
  else {
    return Promise.resolve(localStorage['tweetdeck:user']);
  }
};

TweetdeckDbProto.setUser = function(token) {
  if (IndexedDouchebag.supported) {
    return this.idb.put('keyval', 'user', token);
  }
  else {
    localStorage['tweetdeck:user'] = token;
    return Promise.resolve();
  }
};

module.exports = new TweetdeckDb();
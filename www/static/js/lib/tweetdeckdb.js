var IndexedDouchebag = require('./indexeddouchebag');
var Promise = require('rsvp').Promise;
var User = require('./tweetdeck/user');

function TweetdeckDb() {
  if (IndexedDouchebag.supported) {
    this.idb = new IndexedDouchebag('tweetdeck', 1, function(db, oldVersion) {
      if (oldVersion < 1 || oldVersion === 9223372036854776000) {
        db.createObjectStore('keyval');
      }
    });
  }
}

var TweetdeckDbProto = TweetdeckDb.prototype;

TweetdeckDbProto.getUser = function() {
  var p;

  if (IndexedDouchebag.supported) {
    p = this.idb.get('keyval', 'user');
  }
  else {
    p = Promise.resolve(localStorage['tweetdeck:user']);
  }

  return p.then(function(data) {
    if (!data) {
      return null;
    }
    return new User(data);
  });
};

TweetdeckDbProto.setUser = function(user) {
  if (IndexedDouchebag.supported) {
    return this.idb.put('keyval', 'user', user);
  }
  else {
    localStorage['tweetdeck:user'] = JSON.stringify(user);
    return Promise.resolve();
  }
};

TweetdeckDbProto.deleteUser = function() {
  if (IndexedDouchebag.supported) {
    return this.idb.delete('keyval', 'user');
  }
  else {
    delete localStorage['tweetdeck:user'];
    return Promise.resolve();
  }
};

module.exports = new TweetdeckDb();
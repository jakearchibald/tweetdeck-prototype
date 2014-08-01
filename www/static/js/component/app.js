var tweetdeck = require('../lib/tweetdeck');
var utils = require('../lib/utils');
var Swiper = require('../lib/swiper');
var Component = require('../lib/component');


var columnsTemplate = require('./templates/columns.hbs');
var tweetTemplate = require('./templates/tweet.hbs');

function Columns() {
  Component.call(this);
  this.state = {
    columnSwiping: false,
    columns: []
  };
  this.el = utils.strToEl(columnsTemplate());
  this._columnContainer = this.el.querySelector('.column-panner');

  this._columns = [];

  this._swiper = new Swiper(this.el);
  var largeWidth = window.matchMedia("(min-width: 500px)");
  var handleWidthChange = function () {
    this.setState({
      columnSwiping: !largeWidth.matches
    });
  }.bind(this);

  largeWidth.addListener(handleWidthChange);
  handleWidthChange();
}

var ColumnsProto = Columns.prototype = Object.create(Component.prototype);

ColumnsProto._render = function(changed) {
  changed.forEach(function(changedState) {
    switch (changedState) {
      case "columnSwiping":
        if (this.state.columnSwiping) {
          this._swiper.start();
          this.el.classList.add('swiping');
        }
        else {
          this._swiper.stop();
          this.el.classList.remove('swiping');
        }
        break;
      case "columns":
        this.updateColumns();
        break;
    }
  }.bind(this));
};

ColumnsProto.updateColumns = function() {
  var data = this.state.columns;
  var updatedColumns = data.map(function(columnData) {
    // if it's already in columns, return it
    for (var i = 0; i < this._columns.length; i++) {
      if (columnData.key == this._columns[i].key) {
        return this._columns[i];
      }
    }
    // else create a new one
    var column = new Column(columnData.key);
    column.setState({
      tweets: columnData.tweets
    });
    return column;
  }.bind(this));

  // add columns to DOM
  this._columns = updatedColumns;
  this._columnContainer.innerHTML = '';
  this._columns.forEach(function(column) {
    this._columnContainer.appendChild(column.el);
  }.bind(this));
};

function Column(key) {
  Component.call(this);
  this.key = key;
  this.el = utils.strToEl('<div class="column"></div>');
  this.state = {
    tweets: null
  };
}

var ColumnProto = Column.prototype = Object.create(Component.prototype);

ColumnProto._render = function(changed) {
  changed.forEach(function(changedState) {
    switch (changedState) {
      case "tweets":
        this.el.innerHTML = '';
        this.state.tweets.forEach(function(tweetData) {
          var tweet = new Tweet(tweetData.key, tweetData);
          this.el.appendChild(tweet.el);
        }.bind(this));
        console.timeEnd('toTweets');
        break;
    }
  }.bind(this));
};

function Tweet(key, data) {
  Component.call(this);
  this.key = key;
  this.el = utils.strToEl(tweetTemplate(data));
}

var TweetProto = Tweet.prototype = Object.create(Component.prototype);

function App(container, user) {
  Component.call(this);

  this.state = {
    accounts: [],
    columns: []
  };

  this._container = container;
  this._user = user;
  this._columnsView = new Columns();

  container.appendChild(this._columnsView.el);

  tweetdeck.getAccounts(user)
    .then(function (accounts) {
      this.setState({
        accounts: accounts
      });
    }.bind(this));

  tweetdeck.getColumns(user)
    .then(function (columns) {
      this.setState({
        columns: columns.map(function (column) {
          column.tweets = makeTweets(100, {
            oldest: Date.now() - (1000 * 60 * 60),
            newest: Date.now()
          });
          return column;
        })
      });
    }.bind(this));
}

var AppProto = App.prototype = Object.create(Component.prototype);

AppProto._render = function(changed) {
  changed.forEach(function(changedState) {
    switch (changedState) {
      case "columns":
        this._columnsView.setState({
          columns: this.state.columns
        });
        break;
    }
  }.bind(this));
};

module.exports = App;

/**
 * Sketchy utils
 */

var corpus = [
  'and', 'the', 'then', 'so', 'when', 'why', 'what', 'who',
  'and', 'the', 'then', 'so', 'when', 'why', 'what', 'who',
  'and', 'the', 'then', 'so', 'when', 'why', 'what', 'who',
  'and', 'the', 'then', 'so', 'when', 'why', 'what', 'who',
  'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
  'toast', 'biscuit', 'nose', 'coat', '#hashtag', '#yup',
  'hello', 'goodbye', 'yup', 'nope', 'house',
  'nefarious', 'blue', 'yellow', 'orange', 'green', 'fushia', 'flowing',
  'quick', 'slow', 'ostentatious', 'hyperactive', 'massive', 'hipster',
  'autumnal', 'hidden', 'bitter', 'misty', 'silent', 'empty', 'dry', 'dark',
  'summer', 'icy', 'delicate', 'quiet', 'white', 'cool', 'spring', 'winter',
  'patient', 'twilight', 'dawn', 'crimson', 'wispy', 'weathered', 'blue',
  'billowing', 'broken', 'cold', 'damp', 'falling', 'frosted', 'green',
  'long', 'late', 'lingering', 'bold', 'little', 'morning', 'muddy', 'old',
  'red', 'rough', 'still', 'small', 'sparkling', 'throbbing', 'shy',
  'wandering', 'withered', 'wild', 'black', 'young', 'holy', 'solitary',
  'fragrant', 'aged', 'snowy', 'proud', 'floral', 'restless', 'divine',
  'polished', 'ancient', 'purple', 'lively', 'nameless', 'baroque',
  'suffering', 'stifling', 'smothering', 'shapeless', 'formless', 'gathering',
  'sensuous', 'stuttering', 'flickering', 'unstoppable', 'spectacular',
  'mountain', 'ocean', 'river', 'hill', 'grass', 'beach', 'narwhal', 'nymph',
  'shark', 'squid', 'octopus', 'mist', 'storm', 'winter',
  'waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning',
  'snow', 'lake', 'sunset', 'pine', 'shadow', 'leaf', 'dawn', 'glitter',
  'forest', 'hill', 'cloud', 'meadow', 'sun', 'glade', 'bird', 'brook',
  'butterfly', 'bush', 'dew', 'dust', 'field', 'fire', 'flower', 'firefly',
  'feather', 'grass', 'haze', 'mountain', 'night', 'pond', 'darkness',
  'snowflake', 'silence', 'sound', 'sky', 'shape', 'surf', 'thunder',
  'violet', 'water', 'wildflower', 'wave', 'water', 'resonance', 'sun',
  'wood', 'dream', 'cherry', 'tree', 'fog', 'frost', 'voice', 'paper',
  'frog', 'smoke', 'star', 'branch', 'lavender', 'shade', 'ninja', 'samurai',
  'fury', 'biscuit',
  '#yolo', '#autotweet'
];

function makeSentence(maxWords, maxChars) {
  var words = ~~(Math.random() * maxWords - 10) + 10;
  var sentence = '';
  var nextWord = '';
  while (words-- && (sentence.length + nextWord.length + 1) <= maxChars) {
    sentence += nextWord + ' ';
    nextWord = corpus[~~(Math.random() * corpus.length)];
  }
  return sentence.trim();
}

function makeTweet(opts) {
    opts = opts || {};
    return {
        created: opts.created || new Date(),
        id: opts.id,
        text: makeSentence(50, 140)
    };
}

/**
 * Returns a list of tweets with sequential ids between two specified dates.
 */
function makeTweets(count, opts) {
    opts = utils.defaults(opts || {}, {
        oldest: 0,
        newest: Date.now(),
        tweet: {}
    });
    var tweets = [];

    while (count--) {
        var date = new Date(Math.floor(Math.random() * (opts.newest - opts.oldest)) + opts.oldest);
        var tweet = makeTweet(opts.tweet);
        tweet.id = '' + date.getTime();
        tweet.created = date;
        tweets.push(tweet);
    }

    return sortBy('created', tweets).map(function (tweet, i, sorted) {
        if (i === 0) {
            tweet.id = '' + (tweet.created = new Date(opts.newest)).getTime();
        }
        if (i === sorted.length - 1) {
            tweet.id = '' + (tweet.created = new Date(opts.oldest)).getTime();
        }
        return tweet;
    });
}

function sortBy(key, tweets) {
    return tweets.sort(function (a, b) {
        return a[key] < b[key];
    });
}

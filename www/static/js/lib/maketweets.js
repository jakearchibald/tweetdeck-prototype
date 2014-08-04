var utils = require('./utils');
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

function sortBy(key, tweets) {
    return tweets.sort(function (a, b) {
        return a[key] < b[key];
    });
}

/**
 * Returns a list of tweets with sequential ids between two specified dates.
 */
module.exports = function makeTweets(count, opts) {
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
};
var makeIntervalConstructor = require('./interval');
var sortUtils = require('./tweetdeck/sort-utils');

module.exports = makeIntervalConstructor(sortUtils.byCreatedAtAsc);

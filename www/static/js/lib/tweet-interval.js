var makeIntervalConstructor = require('./interval');
var columnUtils = require('./tweetdeck/columnUtils');
module.exports = makeIntervalConstructor(columnUtils.sort.byCreatedAtAsc);

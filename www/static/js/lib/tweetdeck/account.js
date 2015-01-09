var utils = require('../utils');

function makeAccount(rawData) {
  return {
    name: rawData.name,
    screenName: rawData.screen_name,
    id: rawData.uid,
    avatar: rawData.avatar,
    default: rawData.default,
    oauth: {
      token: rawData.key,
      secret: rawData.secret
    }
  };
}

module.exports = makeAccount;

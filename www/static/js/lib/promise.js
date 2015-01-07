var rsvp = require('rsvp');

module.exports = self.Promise ? self.Promise : rsvp.Promise;

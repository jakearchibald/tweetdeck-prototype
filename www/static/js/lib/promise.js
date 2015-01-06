var rsvp = require('rsvp');

module.exports = window.Promise ? window.Promise : rsvp.Promise;

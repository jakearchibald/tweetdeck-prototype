var Tweetdeck = require('./lib/tweetdeck');
var Promise = require('rsvp').Promise;
var mediator = require('./mediator');
var utils = require('./lib/utils');

/**
 * Data
 */

var tweetdeck = new Tweetdeck({
  proxy: '//localhost:3001'
});

mediator.subscribe('ui:login:attempt', function (data) {
  console.log('ui:login:attempt', data);
});

/**
 * UI
 */

var React = require('react');
var DOM = React.DOM;
var LoginView = require('./component/login');

// UI setup
React.initializeTouchEvents(true);

// Root View
var AppView = React.createClass({
  render: function () {
    return (
      LoginView({})
    );
  }
});

React.renderComponent(AppView({}), document.querySelector('#app'));

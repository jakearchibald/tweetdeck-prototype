var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var utils = require('./lib/utils');

RSVP.on('error', function (why) {
  console.error(why.stack)
});

/**
 * UI
 */

var React = require('react');
var DOM = React.DOM;
var LoginView = require('./component/login');
var AppView = require('./component/app');


// UI setup
React.initializeTouchEvents(true);

// Root View
var RootView = React.createClass({
  getInitialState: function () {
    return {
      session: JSON.parse(localStorage['tweetdeck:session'] || '{}')
    };
  },

  loginDidSucceed: function (user) {
    localStorage['tweetdeck:session'] = JSON.stringify({ user: user });
    this.setState({
      session: {
        user: user
      }
    });
  },

  render: function () {
    return (
      (this.state.session.user ?
        AppView({ user: this.state.session.user }) :
        LoginView({ onLoginSuccess: this.loginDidSucceed })
      )
    );
  }
});

React.renderComponent(RootView({}), document.querySelector('#app'));

var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var utils = require('./lib/utils');
var tweetdeckDb = require('./lib/tweetdeckdb');

RSVP.on('error', function (why) {
  console.error(why.stack);
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
      initialDataFetched: false,
      user: ""
    };
  },

  componentDidMount: function () {
    tweetdeckDb.getUser().then(function(user) {
      this.setState({
        initialDataFetched: true,
        user: user
      });
    }.bind(this));
  },

  loginDidSucceed: function (user) {
    tweetdeckDb.setUser(user);
    this.setState({
      user: user
    });
  },

  render: function () {
    if (!this.state.initialDataFetched) {
      return null;
    }
    if (this.state.user) {
      return AppView({ user: this.state.user });
    }
    else {
      return LoginView({ onLoginSuccess: this.loginDidSucceed });
    }
  }
});

React.renderComponent(RootView({}), document.querySelector('#app'));

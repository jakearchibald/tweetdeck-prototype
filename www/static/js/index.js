var Tweetdeck = require('./lib/tweetdeck');
var Promise = require('rsvp').Promise;
var utils = require('./lib/utils');
var React = require('react');
var DOM = React.DOM;

var Login = require('./component/login');

var tweetdeck = new Tweetdeck({
  proxy: '//localhost:3001'
});

var AppView = React.createClass({
  render: function () {
    return (
      Login({})
    );
  }
});

React.renderComponent(AppView({}), document.querySelector('#app'));

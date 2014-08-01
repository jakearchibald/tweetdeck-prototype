var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var utils = require('./lib/utils');
var tweetdeckDb = require('./lib/tweetdeckdb');
var Component = require('./lib/component');

RSVP.on('error', function (why) {
  console.error(why.stack);
});

/**
 * UI
 */

var LoginView = require('./component/login');
var AppView = require('./component/app');

function RootView(container) {
  Component.call(this);
  this.state = {
    initialDataFetched: false,
    user: null
  };

  this._container = container;
  this._loginView = null;
  this._appView = null;

  tweetdeckDb.getUser().then(function(user) {
    this.setState({
      initialDataFetched: true,
      user: user
    });
  }.bind(this));
}

var RootViewProto = RootView.prototype = Object.create(Component.prototype);

RootViewProto._loginDidSucceed = function(user) {
  tweetdeckDb.setUser(user);
  this.setState({
    user: user
  });
};

RootViewProto._render = function(changed) {
  if (!this.state.initialDataFetched) {
    return;
  }

  changed.forEach(function(changedState) {
    switch (changedState) {
      case "initialDataFetched":
      case "user":
        if (this.state.user) {
          if (this._loginView) {
            this._loginView.hide();
          }
          if (!this._appView) {
            this._appView = new AppView(this._container, this.state.user);
          }
        }
        else {
          if (!this._loginView) {
            this._loginView = new LoginView();
            this._loginView.on('loginSuccess', function(user) {
              this.loginDidSucceed(user);
            }.bind(this));
            document.body.appendChild(this._loginView.el);
          }
        }
        break;
    }
  }.bind(this));
};

utils.domReady.then(function() {
  var rootView = new RootView(document.querySelector('.app'));
});

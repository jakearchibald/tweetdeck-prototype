var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var utils = require('./lib/utils');
var tweetdeck = require('./lib/tweetdeck');
var tweetdeckDb = require('./lib/tweetdeckdb');

/**
 * UI
 */

var React = require('react');
var DOM = React.DOM;
var LoginView = require('./component/login');
var ColumnsView = require('./component/columns');
var HeaderView = require('./component/header');
var Swiper = require('./lib/swiper.js');

window.DOM = DOM;

// UI setup
React.initializeTouchEvents(true);

// Root View
var RootView = React.createClass({
  getInitialState: function () {
    return {
      localSessionDataFetched: false,
      user: "",
      columns: null,
      accounts: [],
      swiper: this.createSwiper()
    };
  },

  fetchInitialData: function() {
    tweetdeck.initialFetch()
      .then(function () {
        this.setState({
          columns: tweetdeck.columns
        });
      }.bind(this))
      .catch(function(err) {
        if (err.message == 'SessionExpired') {
          this.setState({
            user: null
          });
          tweetdeckDb.deleteUser();
        }
        console.error('Unexpected error', err.stack);
      }.bind(this));
  },

  createSwiper: function () {
    var swiper = new Swiper();
    var largeWidth = window.matchMedia("(min-width: 500px) and (min-height: 500px)");
    var handleWidthChange = function () {
      if (largeWidth.matches) {
        swiper.stop();
      }
      else {
        swiper.start();
      }
    }.bind(this);

    window.addEventListener('resize', function() {
      swiper.updateLayout();
    });

    largeWidth.addListener(handleWidthChange);
    handleWidthChange();
    return swiper;
  },

  componentDidMount: function () {
    tweetdeckDb.getUser().then(function(user) {
      this.setState({
        localSessionDataFetched: true,
        user: user
      });

      if (user) {
        tweetdeck.setUser(user);
        this.fetchInitialData();
      }
    }.bind(this));
  },

  loginDidSucceed: function (user) {
    tweetdeckDb.setUser(user);
    this.setState({
      user: user
    });

    this.fetchInitialData();
  },

  render: function () {
    if (!this.state.localSessionDataFetched) {
      return DOM.div({ className: "app" },
        DOM.div({ className: "page" },
          HeaderView({})
        )
      );
    }

    // TODO: it's possible the user will be logged out during a session,
    // it'd be great if the login were a modal dialog rather than a
    // switch between the columns view
    if (!this.state.user) {
      return DOM.div({ className: "app" },
        DOM.div({ className: "page" },
          HeaderView({}),
          LoginView({ onLoginSuccess: this.loginDidSucceed })
        )
      );
    }

    return DOM.div({ className: "app" },
      DOM.div({ className: "page" },
        HeaderView({ columns: this.state.columns, swiper: this.state.swiper }),
        (this.state.columns ? ColumnsView({ columns: this.state.columns, swiper: this.state.swiper }) : undefined)
      )
    );
  }
});

utils.domReady.then(function() {
  React.renderComponent(RootView({}), document.querySelector('.content'));
});

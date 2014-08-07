var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var utils = require('./lib/utils');
var tweetdeck = require('./lib/tweetdeck');
var tweetdeckDb = require('./lib/tweetdeckdb');
var makeTweets = require('./lib/maketweets');

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
      initialDataFetched: false,
      user: "",
      columns: null,
      accounts: [],
      swiper: this.createSwiper()
    };
  },

  fetchInitialData: function() {
    tweetdeck.getAccounts(this.state.user)
      .then(function (accounts) {
        this.setState({
          accounts: accounts
        });
      }.bind(this));

    tweetdeck.getColumns(this.state.user)
      .then(function (columns) {
        this.setState({
          columns: columns.map(function (column) {
            // TODO: I imagine the Columns/Column component will handle the fetch of tweets
            column.tweets = makeTweets(100, {
              oldest: Date.now() - (1000 * 60 * 60),
              newest: Date.now()
            });
            return column;
          })
        });
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
        initialDataFetched: true,
        user: user
      });

      if (this.state.user) {
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
    if (!this.state.initialDataFetched) {
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

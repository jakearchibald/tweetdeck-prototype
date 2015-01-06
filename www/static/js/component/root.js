const React = require('react');
const DOM = React.DOM;
const LoginView = require('./login');
const ColumnsView = require('./columns');
const HeaderView = require('./header');

const Swiper = require('../lib/swiper.js');
const tweetdeck = require('../lib/tweetdeck');
const tweetdeckDb = require('../lib/tweetdeckdb');

// TODO move data handling to a better palce
const Column = require('../lib/tweetdeck/column');

function createSwiper() {
  const swiper = new Swiper();
  const largeWidth = window.matchMedia('(min-width: 500px) and (min-height: 500px)');
  function handleWidthChange() {
    if (largeWidth.matches) {
      swiper.stop();
    } else {
      swiper.start();
    }
  }

  window.addEventListener('resize', function () {
    swiper.updateLayout();
  });

  largeWidth.addListener(handleWidthChange);
  handleWidthChange();
  return swiper;
}

function makeDefaultColumns(account) {
  return [
    new Column('home', account),
    new Column('mentions', account)
  ];
}

module.exports = React.createClass({
  displayName: 'RootView',

  getInitialState() {
    return {
      account: null,
      attemptedLogin: false,
      columns: null,
      swiper: createSwiper()
    };
  },

  attemptLogin() {
    tweetdeckDb.getUser()
      .then(user => user && tweetdeck.fetchAccount(user))
      .then(account => {
        // Note: account might be not be defined – that's ok
        this.setState({
          account: account,
          columns: account && makeDefaultColumns(account),
          attemptedLogin: true
        });
      })
      .catch(why => console.error(why.stack));
  },

  componentDidMount() {
    this.attemptLogin();
  },

  loginDidSucceed(user) {
    tweetdeckDb.setUser(user)
      .then(this.attemptLogin);
  },

  render() {
    if (!this.state.attemptedLogin) {
      return (
        <div className="app">
          <div className="page">
            <HeaderView />
          </div>
        </div>
      );
    }

    // TODO: it's possible the user will be logged out during a session,
    // it'd be great if the login were a modal dialog rather than a
    // switch between the columns view
    if (!this.state.account) {
      return (
        <div className="app">
          <div className="page">
            <HeaderView />
            <LoginView onLoginSuccess={this.loginDidSucceed} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="app">
          <div className="page">
            <HeaderView columns={this.state.columns} swiper={this.state.swiper} />
            <ColumnsView columns={this.state.columns} swiper={this.state.swiper} />
          </div>
        </div>
      );
    }
  }
});

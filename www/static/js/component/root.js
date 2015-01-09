'use strict';

const React = require('react');
const ReactCSSTransitionGroup = require('react/lib/ReactCSSTransitionGroup');
const LoginView = require('./login');
const ColumnView = require('./column');
const Loader = require('./loader');
const Thread = require('./thread');

const tweetdeck = require('../lib/tweetdeck');
const tweetdeckDb = require('../lib/tweetdeckdb');

// TODO move data handling to a better palce
const Column = require('../lib/tweetdeck/column');

function makeDefaultColumn(account) {
  return new Column('home', account);
}

module.exports = React.createClass({
  displayName: 'RootView',

  getInitialState() {
    return {
      account: null,
      attemptedLogin: false,
      column: null,
      activatedItemNode: null
    };
  },

  attemptLogin() {
    tweetdeckDb.getUser()
      .then(user => {
        if (!user) {
          return;
        }
        // Try to go to idb
        return tweetdeckDb.getAccount(user)
          .then(account => {
            if (account) {
              return account;
            }
            // Fall back to network
            return tweetdeck.fetchAccount(user);
          })
      })
      .then(account => {
        tweetdeckDb.setAccount(account);
        return account;
      })
      .then(account => {
        // Note: account might be not be defined – that's ok
        this.setState({
          account: account,
          attemptedLogin: true,
          column: account && makeDefaultColumn(account)
        });
      })
      .catch(why => console.error(why.stack));
  },

  componentWillMount() {
    this.attemptLogin();
  },

  loginDidSucceed(user) {
    tweetdeckDb.setUser(user)
      .then(this.attemptLogin);
  },

  activateTweet(node, item) {
    this.setState({
      activatedItemNode: {node, item}
    });
  },

  deactivateTweet() {
    this.setState({
      activatedItemNode: null
    });
  },

  render() {
    if (!this.state.attemptedLogin) {
      return (
        <div className="app"></div>
      );
    }

    // TODO: it's possible the user will be logged out during a session,
    // it'd be great if the login were a modal dialog rather than a
    // switch between the columns view
    if (!this.state.account) {
      return (
        <div className="app">
          <LoginView onLoginSuccess={this.loginDidSucceed} />
        </div>
      );
    } else if (!this.state.column) {
      return (
        <div className="app">
          <Loader loading={true}/>
        </div>
      );
    } else {
      return (
        <div className="app">
          <ColumnView column={this.state.column} key={this.state.column.type} onActivateTweet={this.activateTweet} />
          <ReactCSSTransitionGroup transitionName="thread-anim">
            {this.state.activatedItemNode ?
              <Thread
                item={this.state.activatedItemNode.item}
                refNode={this.state.activatedItemNode.node}
                onClose={this.deactivateTweet} />
            :null}
          </ReactCSSTransitionGroup>
        </div>
      );
    }
  }
});

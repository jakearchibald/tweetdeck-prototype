var tweetdeck = require('../lib/tweetdeck');

var React = require('react');
var DOM = React.DOM;

module.exports = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      accounts: []
    };
  },

  componentDidMount: function () {
    tweetdeck.getAccounts(this.props.user)
      .then(function (accounts) {
        this.setState({
          accounts: accounts
        });
      }.bind(this));
  },

  render: function () {
    return (
      DOM.ul({},
        this.state.accounts.map(function (account) {
          return DOM.li({
            key: account.id
          }, account.screenName);
        })
      )
    );
  }
});

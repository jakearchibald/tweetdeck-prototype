var tweetdeck = require('../lib/tweetdeck');

var React = require('react');
var DOM = React.DOM;

module.exports = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      accounts: [],
      columns: []
    };
  },

  componentDidMount: function () {
    tweetdeck.getAccounts(this.props.user)
      .then(function (accounts) {
        this.setState({
          accounts: accounts
        });
      }.bind(this));
    tweetdeck.getColumns(this.props.user)
      .then(function (columns) {
        console.log('columns', columns);
        this.setState({
          columns: columns
        });
      }.bind(this));
  },

  render: function () {
    return (
      DOM.ul({},
        this.state.columns.map(function (column) {
          return DOM.li({ key: column.key },
            column.feeds.map(function (feed) {
              return feed.type;
            }).join(', ')
          );
        })
      )
    );
  }
});

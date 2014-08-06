var React = require('react');
var DOM = React.DOM;
var utils = require('../lib/utils');
var Swiper = require('../lib/swiper');

module.exports = React.createClass({
  componentDidMount: function () {
    this.props.swiper.setColumnsEl(this.refs.columns.getDOMNode());
  },
  render: function () {
    return (
      DOM.div({ className: 'columns', ref: 'columns' },
        DOM.div({ className: 'column-panner' },
          this.props.columns.map(Column)
        )
      )
    );
  }
});

var Column = React.createClass({
  render: function () {
    return (
      DOM.div({ className: 'column', key: this.props.key },
        this.props.tweets.map(Tweet)
      )
    );
  }
});

var Tweet = React.createClass({
  render: function () {
    return (
      DOM.div({ className: 'tweet media', key: this.props.id },
        DOM.div({ className: 'fake-img media__img' }),
        DOM.div({ className: 'media__body' }, this.props.text)
      )
    );
  }
});
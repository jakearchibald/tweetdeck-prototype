var React = require('react');
var DOM = React.DOM;
var utils = require('../lib/utils');
var Swiper = require('../lib/swiper');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      columnSwiping: false,
      pannerX: 0
    };
  },
  componentDidMount: function () {
    var swiper = new Swiper(this.refs.columns.getDOMNode(), function(val) {
      this.setState({
        pannerX: val
      });
    }.bind(this));

    var largeWidth = window.matchMedia("(min-width: 500px)");
    var handleWidthChange = function () {
      this.setState({
        columnSwiping: !largeWidth.matches
      });

      if (largeWidth.matches) {
        swiper.stop();
      }
      else {
        swiper.start();
      }
    }.bind(this);

    largeWidth.addListener(handleWidthChange);
    handleWidthChange();
  },
  render: function () {
    return (
      DOM.div({ className: 'columns', ref: 'columns' },
        DOM.div({ className: 'column-panner', style: {transform: 'translate3d(' + this.state.pannerX + 'px, 0, 0)'} },
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
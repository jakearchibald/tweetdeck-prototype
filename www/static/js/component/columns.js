var React = require('react');
var DOM = React.DOM;
var utils = require('../lib/utils');
var Swiper = require('../lib/swiper');

module.exports = React.createClass({
  componentDidMount: function () {
    var scroller = this.refs.columns.getDOMNode();
    this.props.swiper.setColumnsEl(scroller);

    scroller.addEventListener('wheel', function(event) {
      if (this.props.swiper.isActive()) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      scroller.scrollLeft += event.deltaX;
    }.bind(this));
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
  componentDidMount: function() {
    var scroller = this.refs.scroller.getDOMNode();

    scroller.addEventListener('wheel', function(event) {
      if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        event.preventDefault();
        event.stopPropagation();
        scroller.scrollTop += event.deltaY;
      }
    });
  },
  render: function () {
    return (
      DOM.article({ className: 'column', key: this.props.key },
        DOM.header({ className: 'column-header' },
          this.props.title
        ),
        DOM.div({ className: 'column-scroller', ref: 'scroller' },
          this.props.tweets.map(Tweet)
        )
      )
    );
  }
});

var Tweet = React.createClass({
  render: function () {
    return (
      DOM.article({ className: 'tweet media', key: this.props.id },
        DOM.div({ className: 'fake-img media__img' }),
        DOM.div({ className: 'media__body' }, this.props.text)
      )
    );
  }
});
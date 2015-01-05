var React = require('react/addons');
var DOM = React.DOM;
var cx = React.addons.classSet;
var utils = require('../lib/utils');
var Swiper = require('../lib/swiper');

module.exports = React.createClass({
  displayName: 'Columns',

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
          this.props.columns.map(function(column) {
            return Column({column: column, key: column.key});
          })
        )
      )
    );
  }
});

var Column = React.createClass({
  displayName: 'Column',

  getInitialState: function () {
    return {
      items: [],
      loading: false,
      exhausted: false
    };
  },

  componentDidMount: function() {
    var scroller = this.refs.scroller.getDOMNode();
    var tweets = this.refs.tweets.getDOMNode();

    scroller.addEventListener('wheel', function(event) {
      if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        event.preventDefault();
        event.stopPropagation();
        scroller.scrollTop += event.deltaY;
      }
    });

    this.loadMore();
  },

  loadMore: function() {
    this.setState({ loading: true });
    this.props.column.loadMore().then(function(result) {
      this.setState({
        loading: false,
        items: result.items,
        exhausted: result.exhausted
      });
    }.bind(this));
  },

  render: function () {
    return (
      DOM.article({ className: 'column', key: this.props.column.key },
        DOM.header({ className: 'column-header' },
          this.props.column.title
        ),
        DOM.div({ className: 'column-scroller', ref: 'scroller' },
          DOM.div({ className: 'tweet-container', ref: 'tweets'},
            this.state.items.map(function (item) {
              return Item({ item: item, key:item.id });
            }),
            (!this.state.exhausted ?
              Loader({ loading: this.state.loading, onLoad: this.loadMore, key: 'loader' }) :
              null)
          )
        )
      )
    );
  }
});

var Item = React.createClass({
  displayName: 'Item',

  render: function () {
    return (
      DOM.article({ className: 'tweet media', key: this.props.item.id },
        DOM.div({ className: 'fake-img media__img' }),
        DOM.div({ className: 'media__body',  dangerouslySetInnerHTML: {__html: this.props.item.getHTML()} })
      )
    );
  }
});

var Loader = React.createClass({
  displayName: 'Loader',

  render: function() {
    var classes = cx({
      'column-loader': true,
      'column-loader--loading': this.props.loading
    });
    return (
      DOM.div({ className: classes },
        (this.props.loading ?
          DOM.div({ className: 'column-loader-spinner' },
            DOM.img({ src: 'static/imgs/spinner-bubbles.svg'})
          ) :
          DOM.button({ className: 'column-loader-button', onClick: this.props.onLoad }, 'More Tweets please!'))
      )
    );
  }
});

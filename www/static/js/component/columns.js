var React = require('react');
var DOM = React.DOM;
var utils = require('../lib/utils');
var Swiper = require('../lib/swiper');
var FollowColumnItem = require('./../lib/tweetdeck/followcolumnitem');
var ListAddColumnItem = require('./../lib/tweetdeck/listaddcolumnitem');

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
          this.props.columns.map(function(column) {
            return Column({column: column, key: column.key});
          })
        )
      )
    );
  }
});

var Column = React.createClass({
  getInitialState: function () {
    return {
      items: []
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

      if (scroller.scrollTop + scroller.clientHeight > tweets.clientHeight - 20) {
        this.loadMore();
      }
    }.bind(this));

    this.loadMore();
  },

  loadMore: function() {
    this.setState({loading: true});
    this.props.column.loadMore().then(function(items) {
      this.setState({ loading: false, items: items });
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
                if (item instanceof FollowColumnItem) {
                  return FollowItem({item: item, key:item.id});
                }
                else if (item instanceof ListAddColumnItem) {
                  return ListAddItem({item: item, key:item.id});
                }
                return Item({item: item, key:item.id});
              }
          ),
          this.state.loading ? Loader({column:this.props.column, key:'loader'}) : null)
        )
      )
    );
  }
});

var FollowItem = React.createClass({
  render: function () {
    return (
      DOM.article({ className: 'tweet media', key: this.props.item.id },
        DOM.div({ className: 'fake-img media__img' }),
        DOM.div({ className: 'media__body',  dangerouslySetInnerHTML: {__html: this.props.item.followed.getDescriptionHTML()} })
      )
    );
  }
});

var ListAddItem = React.createClass({
  render: function () {
    return (
      DOM.article({ className: 'tweet media', key: this.props.item.id },
        DOM.div({ className: 'fake-img media__img' }),
        DOM.div({ className: 'media__body'},
          this.props.item.adder.name + ' added you to a list'
        )
      )
    );
  }
});

var Item = React.createClass({
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
  render: function() {
    return (
      DOM.div( {className:'column-loader'},
        DOM.img({ src: 'static/imgs/spinner-small.gif'}),
        DOM.span({}, 'Loading...')
      )
    )
  }
});
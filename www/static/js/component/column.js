'use strict';

const React = require('react/addons');
const Loader = require('./loader');
const Item = require('./column-item');
const domToReact = require('../lib/domtoreact');
const utils = require('../lib/utils');

var header;

utils.domReady.then(_ => {
  header = domToReact(document.querySelector('.app-header'));
});

const update = React.addons.update;

module.exports = React.createClass({
  displayName: 'Column',

  getInitialState() {
    return {
      items: [],
      loading: false,
      exhausted: false,
      cursors: {}
    };
  },

  componentDidMount() {
    this.props.column.addTweetChangeListener(this.handleTweetChanged);
    document.querySelector('.logo').addEventListener('click', this.handleHeaderClick);
    this.loadDown()
      .then(this.loadUp);
  },

  componentWillUnmount() {
    document.querySelector('.logo').removeEventListener('click', this.handleHeaderClick);
  },

  onScroll(e) {
    if (this.state.loadingDown) {
      e.preventDefault();
    }

    var scrollTop = event.target.scrollTop;
    var infiniteScrollDistance = event.target.scrollHeight * 0.20;

    if (event.target.scrollHeight > window.innerHeight &&
        scrollTop + event.target.offsetHeight >= (event.target.scrollHeight - infiniteScrollDistance) &&
        this.state.items.length) {
      this.loadDown();
    }
  },

  handleHeaderClick(e) {
    if (this.state.items.length) {
      this.loadUp();
    }
  },

  handleTweetChanged(changedTweet) {
    this.setState({
      items: this.state.items.map(tweet => {
        if (tweet.id === changedTweet.id) {
          return changedTweet;
        }
        return tweet;
      })
    })
  },

  loadDown() {
    if (this.state.loadingDown) {
      return;
    }
    this.setState({
      loadingDown: true
    });
    // Load tweets below what we have now
    return this.props.column.load({
      cursor: this.state.cursors.down || {}
    }).then(result => {
      var newCursors = this.state.cursors;
      newCursors.down = result.cursors.down;
      newCursors.up = this.state.cursors.up || result.cursors.up;
      this.setState({
        loadingDown: false,
        items: this.state.items.concat(result.items),
        exhausted: false,
        cursors: newCursors
      });
    });
  },

  loadUp() {
    if (this.state.loadingUp) {
      return;
    }
    this.setState({
      loadingUp: true
    });
    // Load tweets above what we have now
    return this.props.column.load({
      cursor: this.state.cursors.up || {}
    }).then(result => {
      var newCursors = this.state.cursors;
      newCursors.up = result.cursors.up;
      var newItems = result.items.concat(this.state.items);
      // If there's a gap, we should clear everything and try again
      if (result.containsGap) {
        newCursors = result.cursors;
        newItems = result.items;
      }
      this.setState({
        loadingUp: false,
        items: newItems,
        cursors: newCursors
      });
    });
  },

  render() {
    return (
      <div className="column" onScroll={this.onScroll}>
        {header}
        {this.state.items.map(item => <Item item={item} key={item.id} onFavorite={this.favoriteTweet} onRetweet={this.retweetTweet} onActivateTweet={this.props.onActivateTweet} />)}
        {this.state.exhausted ? null : <Loader loading={this.state.loadingDown} onLoad={this.loadDown} />}
      </div>
    );
  },

  favoriteTweet(tweet) {
    this.props.column.favoriteTweet(tweet);
  },

  retweetTweet(tweet) {
    this.props.column.retweetTweet(tweet);
  }
});

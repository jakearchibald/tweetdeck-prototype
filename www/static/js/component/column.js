'use strict';

const React = require('react/addons');
const Immutable = require('immutable');
const Loader = require('./loader');
const Item = require('./column-item');

const update = React.addons.update;

module.exports = React.createClass({
  displayName: 'Column',

  getInitialState() {
    return {
      items: Immutable.OrderedMap(),
      loading: false,
      exhausted: false,
      cursors: {}
    };
  },

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    this.loadDown();
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  handleScroll(e) {
    if (this.state.loadingDown) {
      e.preventDefault();
    }
    if (document.body.clientHeight > window.innerHeight &&
        document.documentElement.scrollTop + window.innerHeight > document.body.clientHeight &&
        this.state.items.length) {
      this.loadDown();
    }
  },

  loadDown() {
    if (this.state.loadingDown) {
      return;
    }
    this.setState({
      loadingDown: true
    });
    // Load tweets below what we have now
    this.props.column.load({
      cursor: this.state.cursors.down || {}
    }).then(result => {
      var newCursors = this.state.cursors;
      newCursors.down = result.cursors.down;
      newCursors.up = this.state.cursors.up || result.cursors.up;
      this.setState({
        loadingDown: false,
        items: this.state.items.merge(result.items),
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
    this.props.column.load({
      cursor: this.state.cursors.up || {}
    }).then(result => {
      var newCursors = this.state.cursors;
      newCursors.up = result.cursors.up;
      this.setState({
        loadingUp: false,
        items: result.items.merge(this.state.items),
        cursors: newCursors
      });
    });
  },

  favorite(tweetItem) {
    this.setState({
      items: this.state.items.set(tweetItem.id,
                 update(tweetItem, { isFavorite: { $set: true } }))
    });
  },

  render() {
    return (
      <div className="column">
        {this.state.items.count() === 0 ? <Loader loading={this.state.loadingUp} onLoad={this.loadUp} /> : null}
        {this.state.items.map(item => <Item item={item} key={item.id} onFavorite={this.favorite} />).toArray()}
        {this.state.exhausted ? null : <Loader loading={this.state.loadingDown} onLoad={this.loadDown} />}
      </div>
    );
  }
});

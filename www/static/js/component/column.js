'use strict';

const React = require('react');
const Loader = require('./loader');
const Item = require('./column-item');

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
    this.loadDown();
  },

  loadDown() {
    this.setState({
      loadingDown: true
    });
    // Load tweets below what we have now
    this.props.column.load({
      cursor: this.state.cursors.down || {}
    }).then(result => {
      var newCursors = this.state.cursors;
      newCursors.down = result.cursors.down;
      newCursors.up = newCursors.up || result.cursors.up;
      this.setState({
        loadingDown: false,
        items: this.state.items.concat(result.items),
        exhausted: result.exhausted,
        cursors: newCursors
      });
    });
  },

  loadUp() {
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
        items: result.items.concat(this.state.items),
        cursors: newCursors
      });
    });
  },

  render() {
    return (
      <div className="column">
        {this.state.items.length ? <Loader loading={this.state.loadingUp} onLoad={this.loadUp} /> : null}
        {this.state.items.map(item => <Item item={item} key={item.id} />)}
        {this.state.exhausted ? null : <Loader loading={this.state.loadingDown} onLoad={this.loadDown} />}
      </div>
    );
  }
});

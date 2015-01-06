'use strict';

const React = require('react');
const Loader = require('./loader');
const Item = require('./column-item');
var _ = require('lodash');

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
    const scroller = this.refs.scroller.getDOMNode();
    const items = this.refs.items.getDOMNode();

    scroller.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
        event.preventDefault();
        event.stopPropagation();
        scroller.scrollTop += event.deltaY;
      }
    });

    this.loadMore();
  },

  loadMore() {
    this.setState({ loading: true });
    this.props.column.load({
      cursor: this.state.cursors.down || {}
    }).then(result => {
      this.setState({
        loading: false,
        items: this.state.items.concat(result.items),
        exhausted: result.exhausted,
        cursors: result.cursors
      });
    });
  },

  render() {
    return (
      <article className="column">
        <header className="column-header">
          {this.props.column.title}
        </header>
        <div className="column-scroller" ref="scroller">
          <div className="tweet-container" ref="items">
            {this.state.items.map(item => <Item item={item} key={item.id} />)}
            {this.state.exhausted ? null : <Loader loading={this.state.loading} onLoad={this.loadMore} key="loader" />}
          </div>
        </div>
      </article>
    );
  }
});

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
      exhausted: false
    };
  },

  componentDidMount() {
    const scroller = this.refs.scroller.getDOMNode();
    const tweets = this.refs.tweets.getDOMNode();

    scroller.addEventListener('wheel', (event) => {
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
    this.props.column.loadMore().then((result) => {
      this.setState({
        loading: false,
        items: result.items,
        exhausted: result.exhausted
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
          <div className="tweet-container" ref="tweets">
            {this.state.items.map((item) => <Item item={item} key={item.id} />)}
            {this.state.exhausted ? null : <Loader loading={this.state.loading} onLoad={this.loadMore} key="loader" />}
          </div>
        </div>
      </article>
    );
  }
});

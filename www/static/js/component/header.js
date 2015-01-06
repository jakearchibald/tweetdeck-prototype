'use strict';

const React = require('react');

const domToReact = require('../lib/domtoreact');
const ColumnHeadingsNav = require('./column-heading-nav');

module.exports = React.createClass({
  displayName: 'HeaderView',

  getDefaultProps() {
    return {
      title: domToReact(document.querySelector('.app-title')),
      columns: null,
      swiper: null
    };
  },

  render() {
    if (this.props.columns) {
      return (
        <header className="app-header">
          {this.props.title}
          <ColumnHeadingsNav columns={this.props.columns} swiper={this.props.swiper} />
        </header>
      );
    }
    else {
      return (
        <header className="app-header">
          {this.props.title}
        </header>
      );
    }
  }
});

'use strict';

const React = require('react');
const DOM = React.DOM;

const domToReact = require('../lib/domtoreact');
const ColumnHeadingsNav = React.createFactory(require('./column-heading-nav'));

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
      return DOM.header({ className: 'app-header' },
        this.props.title,
        ColumnHeadingsNav({ columns: this.props.columns, swiper: this.props.swiper })
      );
    }
    else {
      return DOM.header({ className: 'app-header' },
        this.props.title
      );
    }
  }
});

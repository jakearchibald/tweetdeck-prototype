'use strict';

const React = require('react');
const DOM = React.DOM;
const MobileColumnHeadings = require('../lib/mobilecolumnheadings');

const ColumnHeading = React.createClass({
  render() {
    return DOM.li({ className: 'column-headings-nav-item' },
      this.props.title
    );
  }
});

module.exports = React.createClass({
  getDefaultProps() {
    return {
      swiper: null
    };
  },
  componentDidMount() {
    var mobileColumnHeadings = new MobileColumnHeadings(this.refs.headingsNav.getDOMNode());

    this.props.swiper.on('render', (pos) => mobileColumnHeadings.render(pos));
    this.props.swiper.on('layoutupdate', () => mobileColumnHeadings.updateLayout());
  },
  render() {
    return DOM.div({ className: 'column-headings-nav', ref: 'headingsNav' },
      DOM.ol({ className: 'column-headings-nav-panner' },
        this.props.columns.map(ColumnHeading)
      ),
      DOM.div({ className: 'column-headings-nav-pips' },
        this.props.columns.map(function(column) {
          return DOM.div({ className: 'pip', key:column.key},
            DOM.div({ className: 'pip-fill' })
          );
        })
      )
    );
  }
});

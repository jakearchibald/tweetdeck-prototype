'use strict';

const React = require('react/addons');
const Column = React.createFactory(require('./column'));
const DOM = React.DOM;

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
            return Column({ column: column, key: column.type });
          })
        )
      )
    );
  }
});

'use strict';

const React = require('react/addons');
const Column = require('./column');
const DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'Columns',

  componentDidMount() {
    const scroller = this.refs.columns.getDOMNode();
    this.props.swiper.setColumnsEl(scroller);

    scroller.addEventListener('wheel', (event) => {
      if (this.props.swiper.isActive()) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      scroller.scrollLeft += event.deltaX;
    });
  },

  render() {
    return (
      <div className="columns" ref="columns">
        <div className="column-panner">
          {this.props.columns.map((column) => <Column column={column} key={column.type} />)}
        </div>
      </div>
    );
  }
});

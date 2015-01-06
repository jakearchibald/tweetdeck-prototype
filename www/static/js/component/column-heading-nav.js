'use strict';

const React = require('react');
const MobileColumnHeadings = require('../lib/mobilecolumnheadings');

const ColumnHeading = React.createClass({
  render() {
    return (
      <li className="column-headings-nav-item">{this.props.title}</li>
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
    const mobileColumnHeadings = new MobileColumnHeadings(this.refs.headingsNav.getDOMNode());

    this.props.swiper.on('render', (pos) => mobileColumnHeadings.render(pos));
    this.props.swiper.on('layoutupdate', _ => mobileColumnHeadings.updateLayout());
  },

  render() {
    return (
      <div className="column-headings-nav" ref="headingsNav">
        <ol className="column-headings-nav-panner">
          {this.props.columns.map(c => <ColumnHeading title={c.title} key={c.type} />)}
        </ol>
        <div className="column-headings-nav-pips">
          {this.props.columns.map(c => <div className="pip" key={c.type}><div className="pip-fill" /></div>)}
        </div>
      </div>
    );
  }
});

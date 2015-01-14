'use strict';

const React = require('react/addons');
const cx = React.addons.classSet;

module.exports = React.createClass({
  displayName: 'Loader',

  render() {
    const classes = cx({
      'column-loader': true,
      'column-loader--loading': this.props.loading
    });
    return (
      <div className={classes}>
        {this.renderInner()}
      </div>
    );
  },

  renderInner() {
    if (this.props.loading) {
      return (
        <div className="column-loader-spinner">
          <img src="static/build/imgs/spinner-bubbles.svg" />
        </div>
      );
    } else {
      return (
        <button className="column-loader-button" onClick={this.props.onLoad}>More Tweets please!</button>
      );
    }
  }
});

'use strict';

const React = require('react/addons');
const cx = React.addons.classSet;

module.exports = React.createClass({
  getInitialState() {
    return { mounted: false };
  },

  componentDidMount() {
    // For the animation
    this.setState({
      mounted: true
    });
  },

  render() {
    const classes = cx({
      closed: !this.state.mounted,
      'modal-dialog': true
    });

    return (
      <div className="modal-overlay">
        <div className={classes} ref="container">
          {this.props.contentComponent}
        </div>
      </div>
    );
  }
});

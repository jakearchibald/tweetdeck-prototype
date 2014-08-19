var React = require('react');
var DOM = React.DOM;

module.exports = React.createClass({

  componentDidMount: function () {
    this.refs.container.getDOMNode().classList.remove('closed');
  },

  render: function () {
    return DOM.div({
      className: 'modal-dialog closed',
      ref: 'container'
    }, this.props.contentComponent);
  }
});

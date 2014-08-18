var React = require('react');
var DOM = React.DOM;

module.exports = React.createClass({

  componentDidMount: function () {
    setTimeout(function () {
      this.refs.container.getDOMNode().classList.remove('closed');
    }.bind(this), 1);
  },

  render: function () {
    return DOM.div({
      className: 'login-form__container closed',
      ref: 'container'
    }, this.props.loginComponent);
  }
});

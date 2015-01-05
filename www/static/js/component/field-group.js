'use strict';

const React = require('react');
const DOM = React.DOM;

module.exports = React.createClass({
  displayName: 'FieldGroup',
  render: function () {
    return DOM.div({ className: 'login-form__field-group' }, this.props.children);
  }
});

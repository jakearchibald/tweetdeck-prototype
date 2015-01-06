'use strict';

const React = require('react');

module.exports = React.createClass({
  displayName: 'FieldGroup',
  render() {
    return <div className="login-form__field-group">{this.props.children}</div>;
  }
});

'use strict';

const React = require('react');
const FieldGroup = require('../field-group');

module.exports = React.createClass({
  onSubmit(e) {
    e.preventDefault();
    const username = this.refs.username.getDOMNode().value;
    const password = this.refs.password.getDOMNode().value;
    this.props.onSubmit(username, password);
  },

  componentDidMount() {
    this.refs.username.getDOMNode().focus();
  },

  render() {
    return (
      <form className="login-form" method="POST" onSubmit={this.onSubmit}>
        <div className="login-form__error-message">
          <p>{this.props.loginMessage}</p>
        </div>
        <FieldGroup>
          <input
            type="text"
            name="username"
            ref="username"
            required="true"
            placeholder="Phone email or username" />
        </FieldGroup>
        <FieldGroup>
          <input
            type="password"
            name="password"
            ref="password"
            required="true"
            placeholder="Password" />
          <button type="submit" className="button login-form__submit-button">Sign in</button>
        </FieldGroup>
      </form>
    );
  }
});

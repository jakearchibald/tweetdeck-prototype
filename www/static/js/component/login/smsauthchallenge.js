'use strict';

const React = require('react');
const FieldGroup = require('../field-group');

module.exports = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired
  },

  onSubmit(e) {
    e.preventDefault();
    const code = this.refs.mobilecode.getDOMNode().value;
    this.props.onSubmit(code);
  },

  render() {
    return (
      <form className="mobile-challenge-form" method="POST" onSubmit={this.onSubmit}>
        <FieldGroup>
          <input
            type="text"
            name="mobilecode"
            ref="mobilecode"
            required="true"
            placeholder="Mobile auth code" />
          <button type="submit">Sign in</button>
          <div className="login-message">
            <p>{this.props.loginMessage}</p>
          </div>
        </FieldGroup>
      </form>
    );
  }
});

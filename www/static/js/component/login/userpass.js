var React = require('react');
var DOM = React.DOM;

var FieldGroup = React.createClass({
  render: function () {
    return DOM.div({ className: 'login-form__field-group' }, this.props.children);
  }
});

module.exports = React.createClass({

  onSubmit: function (e) {
    e.preventDefault();
    var username = this.refs.username.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    this.props.onSubmit(username, password);
  },

  render: function () {
    return DOM.form({ className: 'login-form', method: 'POST', onSubmit: this.onSubmit },
      DOM.p({}, 'Sign in with your Twitter account'),
      DOM.div({ className: 'login-form__error-message' },
        DOM.p({}, this.props.loginMessage)
      ),
      FieldGroup({},
        DOM.input({
          type: 'text',
          name: 'username',
          ref: 'username',
          required: true,
          placeholder: '@username'
        })
      ),
      FieldGroup({},
        DOM.input({
          type: 'password',
          name: 'password',
          ref: 'password',
          required: true,
          placeholder: 'Password'
        }),
        DOM.button({ type: 'submit', className: 'button login-form__submit-button' }, 'Sign in')
      )
    );
  }
});

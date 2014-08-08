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
      FieldGroup({},
        DOM.input({
          type: 'text',
          name: 'username',
          ref: 'username',
          required: true,
          placeholder: 'Username or email'
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
        DOM.button({ type: 'submit' }, 'Sign in')
      ),
      DOM.div({ className: 'login-message' },
        DOM.p({}, this.props.loginMessage)
      )
    );
  }
});

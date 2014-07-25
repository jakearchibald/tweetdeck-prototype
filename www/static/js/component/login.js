var mediator = require('../mediator');
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
    mediator.publish('ui:login:attempt', {
      username: this.refs.username.getDOMNode().value,
      password: this.refs.password.getDOMNode().value
    });
  },

  render: function () {
    return (
      DOM.form({ className: 'login-form', method: 'POST', onSubmit: this.onSubmit },
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
        )
      )
    );
  }
});

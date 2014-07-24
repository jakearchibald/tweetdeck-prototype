var React = require('react');
var DOM = React.DOM;

var FieldGroup = React.createClass({
  render: function () {
    return DOM.div({ className: 'login-form__field-group' }, this.props.children);
  }
});

module.exports = React.createClass({
  render: function () {
    return (
      DOM.form({ className: 'login-form', method: 'POST' },
        FieldGroup({},
          DOM.input({ type: 'text', name: 'username', required: true, placeholder: 'Username or email' })
        ),
        FieldGroup({},
          DOM.input({ type: 'password', name: 'password', required: true, placeholder: 'Password' }),
          DOM.button({ type: 'submit' },
            'Sign in'
          )
        )
      )
    );
  }
});

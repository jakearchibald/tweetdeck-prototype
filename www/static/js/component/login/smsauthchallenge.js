var React = require('react');
var DOM = React.DOM;

var FieldGroup = React.createClass({
  render: function () {
    return DOM.div({ className: 'login-form__field-group' }, this.props.children);
  }
});

module.exports = React.createClass({

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired
  },

  onSubmit: function (e) {
    e.preventDefault();
    var code = this.refs.mobilecode.getDOMNode().value;
    this.props.onSubmit(code);
  },

  render: function () {
    return DOM.form({ className: 'mobile-challenge-form', method: 'POST', onSubmit: this.onSubmit },
      FieldGroup({},
        DOM.input({
          type: 'text',
          name: 'mobilecode',
          ref: 'mobilecode',
          required: true,
          placeholder: 'Mobile auth code'
        })
      ),
      DOM.button({ type: 'submit' }, 'Sign in'),
      DOM.div({ className: 'login-message' },
        DOM.p({}, this.props.loginMessage)
      )
    );
  }
});

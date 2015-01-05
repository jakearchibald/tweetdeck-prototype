'use strict';

const React = require('react');
const DOM = React.DOM;

const FieldGroup = React.createFactory(require('../field-group'));

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

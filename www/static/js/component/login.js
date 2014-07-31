var tweetdeck = require('../lib/tweetdeck');

var React = require('react');
var DOM = React.DOM;

var FieldGroup = React.createClass({
  render: function () {
    return DOM.div({ className: 'login-form__field-group' }, this.props.children);
  }
});

module.exports = React.createClass({
  propTypes: {
    onLoginSuccess: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onLoginSuccess: function () {}
    };
  },

  getInitialState: function () {
    return {
      inProgress: false
    };
  },

  onSubmit: function (e) {
    this.setState({
      inProgress: true
    });
    e.preventDefault();
    var username = this.refs.username.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    tweetdeck
      .login(username, password)
      .then(function (res) {
        if (res.error) {
          return this.setState({
            inProgress: false
          });
        }
        console.log('res', res);
        this.props.onLoginSuccess(res);
      }.bind(this))
      .catch(function (why) {
        console.error(why.stack);
      });
  },

  render: function () {
    if (this.state.inProgress) {
      return DOM.img({ src: 'static/imgs/spinner.gif' });
    }
    else {
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
        )
      );
    }
  }
});

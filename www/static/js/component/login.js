var utils = require('../lib/utils');
var loginTemplate = require('./templates/login.hbs');
var Component = require('../lib/component');
var tweetdeck = require('../lib/tweetdeck');

function Login() {
  Component.call(this);
  this.state = {
    inProgress: false,
    status: "",
    error: false
  };

  this.el = utils.strToEl(loginTemplate());
  this._statusEl = this.el.querySelector('.status');
  this._spinner = this.el.querySelector('.spinner');

  this.el.addEventListener('submit', function(event) {
    this._onFormSubmit(event);
  }.bind(this));
}

var LoginProto = Login.prototype = Object.create(Component.prototype);

LoginProto.show = function() {
  this.setState({
    show: true,
    inProgress: false,
    status: "",
    error: false
  });
};

LoginProto.hide = function() {
  this.setState({
    show: false
  });
};

LoginProto._onFormSubmit = function(event) {
  event.preventDefault();
  var username = this.el.username.value;
  var password = this.el.password.value;

  this.setState({
    inProgress: true,
    status: 'Logging in…',
    error: false
  });

  tweetdeck.login(username, password).then(function(res) {
    if (res.error) {
      this.setState({
        inProgress: false,
        status: res.error,
        error: true
      });
      return;
    }
    console.log('res', res);
    this.emit('loginSuccess', res);
  }.bind(this), function() {
    this.setState({
      inProgress: false,
      status: "Network error",
      error: true
    });
  }.bind(this));
};

LoginProto._render = function(changed) {
  changed.forEach(function(changedState) {
    switch (changedState) {
      case "show":
        if (this.state.show) {
          this.el.style.display = 'block';
        }
        else {
          this.el.style.display = '';
        }
        break;
      case "inProgress":
        this._spinner.style.display = this.state.inProgress ? "block" : "none";
        break;
      case "status":
        this._statusEl.textContent = this.state.status;
        break;
      case "error":
        if (this.state.error) {
          this._statusEl.classList.add('error');
        }
        else {
          this._statusEl.classList.remove('error');
        }
        break;
    }
  }.bind(this));
};


module.exports = Login;
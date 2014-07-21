var utils = require('../lib/utils.js');
var loginTemplate = require('./templates/login.hbs');
var EventEmitter = require('events').EventEmitter;

function Login() {
  var thisLogin = this;
  EventEmitter.call(this);
  this.el = utils.strToEl(loginTemplate());
  this._statusEl = this.el.querySelector('.status');

  this.el.style.display = "none";
  this.el.addEventListener('submit', function(event) {
    event.preventDefault();
    thisLogin.emit('submit', {
      username: thisLogin.el.username.value.trim(),
      password: thisLogin.el.password.value.trim()
    });
  });
}

var LoginProto = Login.prototype = Object.create(EventEmitter.prototype);

LoginProto.show = function() {
  this.el.style.display = "block";
};

LoginProto.hide = function() {
  this.el.style.display = "none";
};

LoginProto.setStatus = function(text, isError) {
  if (isError) {
    this._statusEl.classList.add('err');
  }
  else {
    this._statusEl.classList.remove('err');
  }
  this._statusEl.textContent = text;
};

LoginProto.hideStatus = function() {
  this._statusEl.textContent = "";
};

module.exports = Login;
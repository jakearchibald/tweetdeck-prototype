var EventEmitter = require('events').EventEmitter;

function Component() {
  EventEmitter.call(this);
  this.state = {};
}

var ComponentProto = Component.prototype = Object.create(EventEmitter.prototype);

ComponentProto.setState = function(updates) {
  var keys = Object.keys(updates);

  var keysChanged = keys.filter(function(key) {
    var changed = this.state[key] !== updates[key];
    this.state[key] = updates[key];
    return changed;
  }.bind(this));

  this._render(keysChanged);
};

ComponentProto._render = function() {};

module.exports = Component;
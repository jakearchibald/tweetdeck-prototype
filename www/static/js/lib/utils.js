var Promise = require('rsvp').Promise;

exports.defaults = function defaults(opts, defaultOpts) {
  var r = Object.create(defaultOpts);

  if (!opts) { return r; }

  for (var key in opts) if (opts.hasOwnProperty(key)) {
    r[key] = opts[key];
  }

  return r;
};

exports.domReady = new Promise(function(resolve) {
  function checkState() {
    if (document.readyState == 'interactive' || document.readyState == 'complete') {
      resolve();
    }
  }
  document.addEventListener('readystatechange', checkState);
  checkState();
});

exports.promiseDoneErr = function promiseDoneErr(err) {
  setTimeout(function() {
    throw err;
  }, 0);
};

exports.strToEl = (function () {
  var tmpEl = document.createElement('div');
  return function (str) {
    var r;
    tmpEl.innerHTML = str;
    r = tmpEl.children[0];
    tmpEl.innerHTML = '';
    return r;
  };
}());
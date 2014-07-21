var Promise = require('rsvp').Promise;

function defaults(opts, defaultOpts) {
  var r = Object.create(defaultOpts);

  if (!opts) { return r; }
  
  for (var key in opts) if (opts.hasOwnProperty(key)) {
    r[key] = opts[key];
  }

  return r;
}

var domReady = new Promise(function(resolve) {
  function checkState() {
    if (document.readyState == 'interactive' || document.readyState == 'complete') {
      resolve();
    }
  }
  document.addEventListener('readystatechange', checkState);
  checkState();
});

function promiseDoneErr(err) {
  setTimeout(function() {
    throw err;
  }, 0);
}

var tmpEl = document.createElement('div');
function strToEl(str) {
  var r;
  tmpEl.innerHTML = str;
  r = tmpEl.children[0];
  tmpEl.innerHTML = '';
  return r;
}

exports.defaults = defaults;
exports.domReady = domReady;
exports.promiseDoneErr = promiseDoneErr;
exports.strToEl = strToEl;
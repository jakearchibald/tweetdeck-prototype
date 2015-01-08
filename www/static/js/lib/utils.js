const Promise = require('./promise');

exports.defaults = function defaults(opts, defaultOpts) {
  var r = {};

  for (var key in defaultOpts) if (defaultOpts.hasOwnProperty(key)) {
    r[key] = defaultOpts[key];
  }

  if (!opts) { return r; }

  for (key in opts) if (opts.hasOwnProperty(key)) {
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

exports.setTransform = function setTransform(el, val) {
  el.style.WebkitTransform = el.style.transform = val;
};

exports.objToUrlParams = function objToUrlParams(obj) {
  return Object.keys(obj).reduce(function(str, key, i) {
    if (i) {
      str += '&';
    }
    str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    return str;
  }, '');
};


var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

exports.escapeHTML = function escapeHTML(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = DAY * 365;
const MONTH = YEAR / 12;

const timeFormats = [
  [ 0.7 * MINUTE, 'now' ],
  [ 60 * MINUTE, 'm', MINUTE ],
  [ DAY, 'h', HOUR ],
  [ Infinity, 'd', DAY ]
];

exports.relativeTime = function(input, reference) {
  if (!reference) {
    reference = Date.now();
  }

  var delta = reference - input;

  var format = timeFormats.find(function(format) {
    return delta < format[0];
  });

  if (format[2]) {
    return Math.round(delta/format[2]) + format[1];
  }
  return format[1];
};

exports.closest = function(el, selector) {
  if (el.closest) {
    return el.closest(selector);
  }

  var matches = el.matches || el.msMatchesSelector;

  do {
    if (el.nodeType != 1) continue;
    if (matches.call(el, selector)) return el;
  } while (el = el.parentNode);

  return undefined;
};
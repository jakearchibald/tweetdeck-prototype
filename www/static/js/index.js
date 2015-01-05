'use strict';
// 'polyfills'
require('6to5/polyfill');
require('fetch');

const React = require('react');
const utils = require('./lib/utils');
const RootView = React.createFactory(require('./component/root'));

// UI setup
React.initializeTouchEvents(true);

utils.domReady.then(function () {
  React.render(RootView({}), document.querySelector('.content'));
}).catch(why => console.error(why.stack));

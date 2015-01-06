'use strict';
// 'polyfills'
require('6to5/polyfill');
require('fetch');

const React = require('react');
const utils = require('./lib/utils');
const RootView = require('./component/root');

// UI setup
React.initializeTouchEvents(true);

utils.domReady.then(
  React.render.bind(React, <RootView />, document.querySelector('.content'))
).catch(why =>
  console.error(why.stack)
);

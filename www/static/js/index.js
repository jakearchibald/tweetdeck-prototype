'use strict';
require('regenerator/runtime');

const RSVP = require('rsvp');
const Promise = RSVP.Promise;
const utils = require('./lib/utils');

/**
 * UI
 */

const React = require('react');
const DOM = React.DOM;
const LoginView = require('./component/login');
const ColumnsView = require('./component/columns');
const HeaderView = require('./component/header');
const Swiper = require('./lib/swiper.js');

const RootView = React.createFactory(require('./component/root'));

window.DOM = DOM;

// UI setup
React.initializeTouchEvents(true);

utils.domReady.then(function () {
  React.render(RootView({}), document.querySelector('.content'));
});

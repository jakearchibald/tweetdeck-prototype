var utils = require('../lib/utils');
var domToReact = require('../lib/domtoreact');

var React = require('react');
var DOM = React.DOM;

var Header = React.createClass({
  getDefaultProps: function() {
    return {
      title: domToReact(document.querySelector('.title'))
    };
  },
  render: function () {
    return DOM.header({},
      this.props.title
    );
  }
});

module.exports = Header;
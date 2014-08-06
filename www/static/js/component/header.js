var utils = require('../lib/utils');
var domToReact = require('../lib/domtoreact');

var React = require('react');
var DOM = React.DOM;

var Header = React.createClass({
  getDefaultProps: function() {
    return {
      title: domToReact(document.querySelector('.app-title')),
      columns: []
    };
  },
  render: function () {
    return DOM.header({ className: 'app-header' },
      this.props.title,
      ColumnHeadingsNav({ columns: this.props.columns })
    );
  }
});

var ColumnHeadingsNav = React.createClass({
  render: function () {
    return DOM.div({ className: 'column-headings-nav' },
      DOM.ol({ className: 'column-headings-nav-panner' },
        this.props.columns.map(ColumnHeading)
      ),
      DOM.div({ className: 'column-headings-nav-pips' },
        this.props.columns.map(function() {
          return DOM.div({ className: 'pip' },
            DOM.div({ className: 'pip-fill' })
          );
        })
      )
    );
  }
});

var ColumnHeading = React.createClass({
  render: function () {
    return DOM.li({ className: 'column-headings-nav-item' },
      this.props.title
    );
  }
});

module.exports = Header;
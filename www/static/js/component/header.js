var utils = require('../lib/utils');
var domToReact = require('../lib/domtoreact');
var MobileColumnHeadings = require('../lib/mobilecolumnheadings');

var React = require('react');
var DOM = React.DOM;

var Header = React.createClass({
  getDefaultProps: function() {
    return {
      title: domToReact(document.querySelector('.app-title')),
      columns: null,
      swiper: null
    };
  },
  render: function () {
    if (this.props.columns) {
      return DOM.header({ className: 'app-header' },
        this.props.title,
        ColumnHeadingsNav({ columns: this.props.columns, swiper: this.props.swiper })
      );
    }
    else {
      return DOM.header({ className: 'app-header' },
        this.props.title
      );
    }
  }
});

var ColumnHeadingsNav = React.createClass({
  getDefaultProps: function() {
    return {
      swiper: null
    };
  },
  componentDidMount: function() {
    var mobileColumnHeadings = new MobileColumnHeadings(this.refs.headingsNav.getDOMNode());

    this.props.swiper.on('render', function(pos) {
      mobileColumnHeadings.render(pos);
    });

    this.props.swiper.on('layoutupdate', function(pos) {
      mobileColumnHeadings.updateLayout();
    });
  },
  render: function () {
    return DOM.div({ className: 'column-headings-nav', ref: 'headingsNav' },
      DOM.ol({ className: 'column-headings-nav-panner' },
        this.props.columns.map(ColumnHeading)
      ),
      DOM.div({ className: 'column-headings-nav-pips' },
        this.props.columns.map(function(o, i, arr) {
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
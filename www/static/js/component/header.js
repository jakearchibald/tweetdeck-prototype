var utils = require('../lib/utils');
var domToReact = require('../lib/domtoreact');

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
    // this is hacky and horrible and should be broken out into another object
    var headingsNav = this.refs.headingsNav.getDOMNode();
    var panner = this.refs.panner.getDOMNode();
    var pips = Array.prototype.slice.call(headingsNav.querySelectorAll('.pip-fill'));

    this.props.swiper.on('change', function(pos) {
      var width = headingsNav.offsetWidth;
      var minOffset = -panner.scrollWidth + width;
      panner.style.transform = 'translate3d(' + (minOffset * pos) + 'px, 0, 0)';

      pips.forEach(function(pip, i, arr) {
        var phase = pos * (arr.length - 1) - i;

        if (phase < 1 && phase > -1) {
          pip.style.opacity = 1 - Math.abs(phase);
        }
        else {
          pip.style.opacity = 0;
        }
      });
    });
  },
  render: function () {
    return DOM.div({ className: 'column-headings-nav', ref: 'headingsNav' },
      DOM.ol({ className: 'column-headings-nav-panner', ref: 'panner' },
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
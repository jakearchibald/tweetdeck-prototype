var utils = require('./utils');

function MobileColumnHeadings(container) {
  this._container = container;
  this._panner = container.querySelector('.column-headings-nav-panner');
  this._pips = Array.prototype.slice.call(container.querySelectorAll('.pip-fill'));
  this._minX = 0;

  this.updateLayout();
}

var MobileColumnHeadingsProto = MobileColumnHeadings.prototype;

// connceted to Swiper's layoutupdate event
MobileColumnHeadingsProto.updateLayout = function() {
  var width = this._container.offsetWidth;
  this._minX = -this._panner.scrollWidth + width;
};

// connected to Swiper's render event
MobileColumnHeadingsProto.render = function(pos) {
  // move headings
  utils.setTransform(this._panner, 'translate3d(' + (this._minX * pos) + 'px, 0, 0)');

  // light them pips up
  this._pips.forEach(function(pip, i, arr) {
    var phase = pos * (arr.length - 1) - i;

    if (phase < 1 && phase > -1) {
      pip.style.opacity = 0.2 + (1 - Math.abs(phase));
    }
    else {
      pip.style.opacity = 0.2;
    }
  }.bind(this));
};

module.exports = MobileColumnHeadings;

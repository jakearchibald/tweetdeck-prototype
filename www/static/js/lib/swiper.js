var TweenLite = require('./greensock/TweenLite');
var utils = require('./utils');

function setTransform(el, val) {
  el.style.WebkitTransform = el.style.transform = val;
}

function Swiper(containerEl) {
  this._el = containerEl;
  this._pannerEl = containerEl.querySelector('.column-panner');
  this._touchStartX = 0;
  this._touchStartY = 0;
  this._pannerX = 0;
  this._pannerStartX = 0;
  this._activeColumn = 0;
  this._touchEventLog = null;
  this._currentAnim = null;
  this._updatingOnNextFrame = false;

  var firstTouchMove = true;

  this._onTouchStart = function(event) {
    // let's not worry about multi-touch
    if (event.touches.length > 1) {
      return;
    }

    // TODO: need to update these on resize and column add
    this._columnWidth = this._el.offsetWidth;
    this._scrollWidth = this._pannerEl.scrollWidth;
    this._minX = -(this._scrollWidth - this._columnWidth);

    this._touchEventLog = [];
    firstTouchMove = true;
    this._touchStartX = event.touches[0].clientX;
    this._touchStartY = event.touches[0].clientY;
    
    this._el.addEventListener('touchmove', this._onTouchMove);
  }.bind(this);

  this._onTouchEnd = function(event) {
    if (event.touches.length > 1 || !this._capturing) {
      return;
    }

    var previousX = this._touchEventLog[0].touches[0].clientX;
    var finalX = this._touchEventLog.slice(-1)[0].touches[0].clientX;
    var vel = (finalX - previousX) / (event.timeStamp - this._touchEventLog[0].timeStamp);
    var columnCount = this._scrollWidth / this._columnWidth;
    var velocityRequired = 1.0; // appears to be the magic number

    if (vel < -velocityRequired && this._activeColumn != columnCount - 1) {
      this.goToColumn(this._activeColumn + 1);
    }
    else if (vel > velocityRequired && this._activeColumn !== 0) {
      this.goToColumn(this._activeColumn - 1);
    }
    else {
      this.goToColumn(this._activeColumn);
    }

    this._capturing = false;
    this._el.removeEventListener('touchmove', this._onTouchMove);
  }.bind(this);

  this._onTouchMove = function(event) {
    if (event.touches.length > 1) {
      return;
    }

    if (this._touchEventLog.length == 10) {
      this._touchEventLog.shift();
    }
    this._touchEventLog.push(event);

    if (firstTouchMove) {
      firstTouchMove = false;
      this._onFirstTouchMove(event);
    }
    else {
      this._onCapturedTouchMove(event);
    }
  }.bind(this);
}

var SwiperProto = Swiper.prototype;

SwiperProto.start = function() {
  this._el.style.overflowX = 'hidden';
  this._el.scrollLeft = 0;
  this._pannerX = 0;
  this._updatePositionOnFrame();
  this._el.addEventListener('touchstart', this._onTouchStart);
  this._el.addEventListener('touchend', this._onTouchEnd);
};

SwiperProto.stop = function() {
  this._el.style.overflowX = 'auto';
  setTransform(this._pannerEl, '');
  this._el.removeEventListener('touchstart', this._onTouchStart);
  this._el.removeEventListener('touchend', this._onTouchEnd);
};

SwiperProto._onFirstTouchMove = function(event) {
  var deltaX = event.touches[0].clientX - this._touchStartX;
  var deltaY = event.touches[0].clientY - this._touchStartY;
  var takeOver = (deltaY === 0) || (Math.abs(deltaX / deltaY) > 3);

  if (takeOver) {
    this._killCurrentAnim();
    this._capturing = true;
    this._pannerStartX = this._pannerX;
    this._onCapturedTouchMove(event);
  }
  else {
    this._el.removeEventListener('touchmove', this._onTouchMove);
  }
};

SwiperProto._onCapturedTouchMove = function(event) {
  var deltaX = event.touches[0].clientX - this._touchStartX;
  this._pannerX = Math.max(
    Math.min(this._pannerStartX + deltaX, 0),
    this._minX
  );

  this._updatePositionOnFrame();
  event.preventDefault();
};

SwiperProto._killCurrentAnim = function() {
  if (this._currentAnim) {
    this._currentAnim.kill();
    this._currentAnim = null;
  }
};

SwiperProto._updatePositionOnFrame = function() {
  if (this._updatingOnNextFrame) {
    return;
  }
  this._updatingOnNextFrame = true;

  requestAnimationFrame(function() {
    this._updatePosition();
    this._updatingOnNextFrame = false;
  }.bind(this));
};

SwiperProto._updatePosition = function() {
  setTransform(this._pannerEl, 'translate3d(' + this._pannerX + 'px, 0, 0)');
};

SwiperProto.goToColumn = function(num, opts) {
  opts = utils.defaults(opts, {
    animate: true
  });
  this._killCurrentAnim();
  this._activeColumn = num;
  var from = this._pannerX;
  var to = -(num * this._columnWidth);

  if (opts.animate) {
    this._currentAnim = new TweenLite(this._pannerEl, 0.2, {
      onComplete: function() {
        this._killCurrentAnim();
      }.bind(this),
      onUpdate: function() {
        this._pannerX = from + ((to - from) * this._currentAnim.ratio);
        this._updatePosition();
      }.bind(this)
    });

    this._currentAnim.play();
  }
  else {
    this._pannerX = to;
    this._updatePositionOnFrame();
  }
};

module.exports = Swiper;
var TweenLite = require('./greensock/TweenLite');
var utils = require('./utils');
var EventEmitter = require('events').EventEmitter;

function Swiper() {
  EventEmitter.call(this);

  this._touchStartX = 0;
  this._touchStartY = 0;
  this._pannerX = 0;
  this._pannerStartX = 0;
  this._activeColumn = 0;
  this._touchLog = null;
  this._currentAnim = null;
  this._updatingOnNextFrame = false;
  this._active = false;
  this._columnWidth = 0;
  this._scrollWidth = 0;
  this._minX = 0;

  var firstTouchMove = true;

  this._onTouchStart = function(event) {
    // let's not worry about multi-touch
    if (event.touches.length > 1) {
      return;
    }

    // TODO: need to update these on resize and column add
    this._columnWidth = this._pannerContainer.offsetWidth;
    this._scrollWidth = this._pannerEl.scrollWidth;
    this._minX = -(this._scrollWidth - this._columnWidth);

    firstTouchMove = true;
    this._touchStartX = event.touches[0].clientX;
    this._touchStartY = event.touches[0].clientY;
    
    this._pannerContainer.addEventListener('touchmove', this._onTouchMove);
  }.bind(this);

  this._onTouchEnd = function(event) {
    if (event.touches.length > 1 || !this._capturing) {
      return;
    }

    // get the x position from (up to) 10 moves ago
    var previousX = this._touchLog[0].x;
    var finalX = this._touchLog.slice(-1)[0].x;
    // calculate the velocity
    var vel = (finalX - previousX) / (event.timeStamp - this._touchLog[0].timeStamp);
    var columnCount = this._scrollWidth / this._columnWidth;
    var velocityRequired = 1.0; // appears to be the magic number

    // past the half way point to next column?
    if (finalX < previousX && this._pannerX < -(this._columnWidth * this._activeColumn) - this._columnWidth / 2) {
      this.goToColumn(this._activeColumn + 1);
    }
    // past the half way point to previous column?
    else if (finalX > previousX && this._pannerX > -(this._columnWidth * this._activeColumn) + this._columnWidth / 2) {
      this.goToColumn(this._activeColumn - 1);
    }
    // enough velocity to go to next column?
    else if (vel < -velocityRequired && this._activeColumn != columnCount - 1) {
      this.goToColumn(this._activeColumn + 1);
    }
    // enough velocity to go to previous column?
    else if (vel > velocityRequired && this._activeColumn !== 0) {
      this.goToColumn(this._activeColumn - 1);
    }
    // return to this column position
    else {
      this.goToColumn(this._activeColumn);
    }

    this._capturing = false;
    this._pannerContainer.removeEventListener('touchmove', this._onTouchMove);
  }.bind(this);

  this._onTouchMove = function(event) {
    if (event.touches.length > 1) {
      return;
    }

    if (firstTouchMove) {
      firstTouchMove = false;
      this._onFirstTouchMove(event);
    }
    else {
      this._onCapturedTouchMove(event);
    }
  }.bind(this);
}

var SwiperProto = Swiper.prototype = Object.create(EventEmitter.prototype);

SwiperProto.setColumnsEl = function(el) {
  this._pannerContainer = el;
  this._pannerEl = el.children[0];

  if (this._active) {
    this._activatePannerContainer();
  }
};

SwiperProto.start = function() {
  if (this._active) {
    return;
  }

  this._pannerX = 0;
  this._active = true;

  if (this._pannerContainer) {
    this._activatePannerContainer();
  }
};

SwiperProto._activatePannerContainer = function() {
  this._pannerContainer.style.overflowX = 'hidden';
  this._pannerContainer.scrollLeft = 0;
  this._updatePositionOnFrame();
  this._pannerContainer.addEventListener('touchstart', this._onTouchStart);
  this._pannerContainer.addEventListener('touchend', this._onTouchEnd);
};

SwiperProto._deactivatePannerContainer = function() {
  this._pannerContainer.style.overflowX = 'auto';
  this.goToColumn(0, {
    duration: 0
  });
  this._pannerContainer.removeEventListener('touchstart', this._onTouchStart);
  this._pannerContainer.removeEventListener('touchend', this._onTouchEnd);
};

SwiperProto.stop = function() {
  if (!this._active) {
    return;
  }

  this._active = false;
  
  if (this._pannerContainer) {
    this._deactivatePannerContainer();
  }
};

SwiperProto._onFirstTouchMove = function(event) {
  var deltaX = event.touches[0].clientX - this._touchStartX;
  var deltaY = event.touches[0].clientY - this._touchStartY;

  // decide whether this is enough of a horizontal move to justify takeover
  // 3 seems to be the magic number
  var takeOver = (deltaY === 0) || (Math.abs(deltaX / deltaY) > 3);

  if (takeOver) {
    // we're going to keep a log of the last 10 move events
    this._touchLog = [];
    this._killCurrentAnim();
    this._capturing = true;
    this._pannerStartX = this._pannerX;
    this._onCapturedTouchMove(event);
  }
  else {
    this._pannerContainer.removeEventListener('touchmove', this._onTouchMove);
  }
};

SwiperProto._onCapturedTouchMove = function(event) {
  // keep a log of 10
  var logObj;
  if (this._touchLog.length == 10) {
    // reuse the shifted object to avoid lots of GC during touch
    logObj = this._touchLog.shift();
  }
  else {
    logObj = {};
  }

  logObj.x = event.touches[0].clientX;
  logObj.timeStamp = event.timeStamp;

  this._touchLog.push(logObj);

  var deltaX = logObj.x - this._touchStartX;

  // keep within start & end bounds
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
  this.emit('render', this._pannerX / this._minX || 0);
  utils.setTransform(this._pannerEl, 'translate3d(' + this._pannerX + 'px, 0, 0)');
};

SwiperProto.goToColumn = function(num, opts) {
  opts = utils.defaults(opts, {
    duration: 0.2
  });
  this._killCurrentAnim();
  this._activeColumn = num;
  var from = this._pannerX;
  var to = -(num * this._columnWidth);

  if (opts.duration) {
    this._currentAnim = new TweenLite(this._pannerEl, opts.duration, {
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
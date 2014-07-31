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

  var firstTouchMove = true;

  this._onTouchStart = function(event) {
    if (event.touches.length > 1) {
      return;
    }

    firstTouchMove = true;
    this._touchStartX = event.touches[0].clientX;
    this._touchStartY = event.touches[0].clientY;
    
    this._el.addEventListener('touchmove', this._onTouchMove);
  }.bind(this);

  this._onTouchEnd = function() {
    if (event.touches.length > 1) {
      return;
    }
    this._el.removeEventListener('touchmove', this._onTouchMove);
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

var SwiperProto = Swiper.prototype;

SwiperProto.start = function() {
  this._el.style.overflowX = 'hidden';
  this._el.style.scrollLeft = 0;
  setTransform(this._pannerEl, 'translateZ(0)');
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
  var takeOver = (deltaY === 0) || (Math.abs(deltaX / deltaY) > 4);

  if (takeOver) {
    this._pannerStartX = this._pannerX;
    this._onCapturedTouchMove(event);
  }
  else {
    this._el.removeEventListener('touchmove', this._onTouchMove);
  }
};

SwiperProto._onCapturedTouchMove = function(event) {
  var deltaX = event.touches[0].clientX - this._touchStartX;
  this._pannerX = Math.min(this._pannerStartX + deltaX, 0);

  setTransform(this._pannerEl, 'translate3d(' + this._pannerX + 'px, 0, 0)');
  event.preventDefault();
};

module.exports = Swiper;
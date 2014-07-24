var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var buffer = require('gulp-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var hbsfy = require('hbsfy');
var browserify = require('browserify');
var urlSrc = require('./url-src');
var merge = require('merge-stream');
var path = require('path');
var app = require('./server');
var rename = require('gulp-rename');
var tweetdeckProxy = require('./server/tweetdeck-proxy');

function sassTask(dev) {
  return gulp
    .src('www/static/css/*.scss')
    .pipe(sass({ sourcemap: dev, style: 'compressed' }))
    .pipe(gulp.dest('www/static/build/css/'));
}

gulp.task('sass', function() {
  return sassTask(true);
});

gulp.task('sass-build', function() {
  return sassTask(false);
});

function jsTask(bundler, out, dev) {
  var stream = bundler.bundle({
    debug: dev
  }).pipe(
    source(path.basename(out))
  );

  if (!dev) {
    stream = stream.pipe(buffer()).pipe(uglify());
  }

  return stream.pipe(
    gulp.dest(path.dirname(out))
  );
}

function makeBundler(inSrc, func) {
  return func(inSrc).transform(hbsfy);
}

gulp.task('js', function() {
  return browserify('./www/static/js/index.js')
    .bundle()
    .pipe(source('all.js'))
    .pipe(gulp.dest('www/static/build/js/'));
});

gulp.task('watch', ['sass', 'js'], function() {
  // sass
  gulp.watch('www/static/css/**/*.scss', ['sass']);

  // js
  gulp.watch('www/static/js/**/*.js', ['js']);

  // js-head
  // gulp.watch('www/static/js/head.js', ['js-head']);
});

gulp.task('server', function() {
  app.listen(3000);
  tweetdeckProxy.listen(3001);
});

gulp.task('clean', function() {
  gulp
    .src('build/*', { read: false })
    .pipe(clean());
});

gulp.task('default', ['clean', 'watch', 'server']);

'use strict';

var browserify = require('browserify');
var browserSync = require('browser-sync');
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var to5ify = require('6to5ify');
var watchify = require('watchify');
var buffer = require('vinyl-buffer');

var server = require('./server');
var tweetdeckProxy = require('./server/tweetdeck-proxy');

function streamError(why) {
  console.error(why);
  // End the stream so that the task finished
  this.end();
}

function id(arg) { return arg; }

function sassTask(dev) {
  return gulp
    .src('www/static/css/**/*.scss')
    .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: dev ? 'expanded' : 'compressed' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('www/static/build/css/'))
    .pipe(browserSync.reload({ stream: true }));
}

gulp.task('sass', function() {
  return sassTask(true);
});

gulp.task('sass-build', function() {
  return sassTask(false);
});

gulp.task('copy', ['clean'], function () {
  return gulp.src([
    // Copy all files
    'www/static/**',
    // Exclude the following files
    // (other tasks will handle the copying of these files)
    '!www/static/**/*.scss',
    '!www/static/**/*.js',
    '!www/static/**/*.map'
  ]).pipe(gulp.dest('www/static/build'));
});

gulp.task('browser-sync', function() {
  browserSync({
    notify: true,
    proxy: 'localhost:8002',
    open: false
  });
});

function buildTask(watch) {
  // sass
  if (watch) {
    gulp.watch('www/static/css/**/*.scss', ['sass']);
  }

  var createBundler = function (src) {
    return (watch ? watchify : id)(browserify(src, {
      cache: {}, packageCache: {}, fullPaths: true, // watchify args
      debug: true
    }));
  };

  var bundlers = {
    'all.js': createBundler('./www/static/js/index.js'),
    'sw.js': createBundler('./www/static/js/sw/index.js')
  };

  var rebundle = function rebundle (bundler, outputFile) {
    return bundler.bundle()
      // log errors if they happen
      .on('error', streamError)
      .pipe(source(outputFile))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest('www/static/build/js/'))
      .pipe(browserSync.reload({ stream: true }))
      .on('end', function () {
        console.log('Built all JS');
      });
  };

  Object.keys(bundlers).forEach(function (key) {
    var bundler = bundlers[key];
    bundler.exclude('vertx');
    bundler.transform(to5ify.configure({
      experimental: true
    }));
    bundler.on('update', function () {
      rebundle(bundlers[key], key);
    });
    rebundle(bundlers[key], key);
  });

}

gulp.task('watch', ['sass'], function() {
  buildTask(true);
});

gulp.task('browserify', ['sass'], function () {
  buildTask(false);
});

gulp.task('server', function() {
  server.createApp({
    disableServiceWorker: process.argv.indexOf('--disable-sw') > -1
  }).listen(8002);
  tweetdeckProxy.listen(8001);
});

gulp.task('clean', del.bind(null, 'www/static/build'));

gulp.task('default', ['clean', 'copy', 'watch', 'server', 'browser-sync']);
gulp.task('build', ['clean', 'copy', 'browserify']);

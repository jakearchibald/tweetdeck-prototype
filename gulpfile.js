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

var app = require('./server');
var tweetdeckProxy = require('./server/tweetdeck-proxy');

function streamError(why) {
  console.error(why);
  // End the stream so that the task finished
  this.end();
}

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

gulp.task('browser-sync', function() {
  browserSync({
    notify: true,
    proxy: 'localhost:8002',
    open: false
  });
});

gulp.task('watch', ['sass'], function() {
  // sass
  gulp.watch('www/static/css/**/*.scss', ['sass']);

  // js
  var bundler = watchify(browserify('./www/static/js/index.js', {
    cache: {}, packageCache: {}, fullPaths: true, // watchify args
    debug: true
  }));
  bundler.exclude('vertx');
  bundler.transform(to5ify.configure({
    experimental: true
  }));
  bundler.on('update', rebundle);

  function rebundle () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', streamError)
      .pipe(source('all.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest('www/static/build/js/'))
      .pipe(browserSync.reload({ stream: true }))
      .on('end', function () {
        console.log('Built all.js');
      });
  }

  rebundle();

  // js-head
  // gulp.watch('www/static/js/head.js', ['js-head']);
});

gulp.task('server', function() {
  app.listen(8002);
  tweetdeckProxy.listen(8001);
});

gulp.task('clean', del.bind(null, 'build'));

gulp.task('default', ['clean', 'watch', 'server', 'browser-sync']);

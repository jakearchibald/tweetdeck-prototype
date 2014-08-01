var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var hbsfy = require("hbsfy")
var app = require('./server');
var tweetdeckProxy = require('./server/tweetdeck-proxy');
var rimraf = require('gulp-rimraf');
var uglify = require('gulp-uglify');
var buffer = require('gulp-buffer');

function streamError(why) {
  console.error(why);
  // End the stream so that the task finished
  this.end();
}

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

gulp.task('watch', ['sass'], function() {
  // sass
  gulp.watch('www/static/css/**/*.scss', ['sass']);

  // js
  var bundler = watchify(browserify('./www/static/js/index.js', watchify.args));

  bundler.transform(hbsfy);
  bundler.on('update', rebundle);

  function rebundle () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', streamError)
      .pipe(source('all.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('www/static/build/js/'));
  }

  rebundle();

  // js-head
  // gulp.watch('www/static/js/head.js', ['js-head']);
});

gulp.task('server', function() {
  app.listen(8000);
  tweetdeckProxy.listen(8001);
});

gulp.task('clean', function() {
  gulp
    .src('build/*', { read: false })
    .pipe(rimraf());
});

gulp.task('default', ['clean', 'watch', 'server']);

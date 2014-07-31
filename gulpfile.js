var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var app = require('./server');
var tweetdeckProxy = require('./server/tweetdeck-proxy');
var rimraf = require('gulp-rimraf');

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

gulp.task('js', function() {
  return browserify('./www/static/js/index.js')
    .bundle()
    .on('error', streamError)
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
    .pipe(rimraf());
});

gulp.task('default', ['clean', 'watch', 'server']);

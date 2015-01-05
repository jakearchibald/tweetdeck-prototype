var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var del = require('del');
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
  bundler.exclude('vertx');
  bundler.on('update', rebundle);

  function rebundle () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', streamError)
      .pipe(source('all.js'))
      .pipe(gulp.dest('www/static/build/js/'))
      .on('end', function () {
        console.log('Built all.js');
      });
  }

  rebundle();

  // js-head
  // gulp.watch('www/static/js/head.js', ['js-head']);
});

gulp.task('server', function() {
  app.listen(8000);
  tweetdeckProxy.listen(8001);
});

gulp.task('clean', del.bind(null, 'build'));

gulp.task('default', ['clean', 'watch', 'server']);

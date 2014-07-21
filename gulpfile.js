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
  return gulp.src('www/static/css/*.scss')
    .pipe(sass({
      sourcemap: dev,
      style: 'compressed'
    }))
    .pipe(gulp.dest('www/static/css/'));
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

var browserifyJsMap = {
  "./www/static/js/index.js": "www/static/js/all.js"
};

gulp.task('js-build', function() {
  var streams = Object.keys(browserifyJsMap).map(function(inSrc) {
    var bundler = makeBundler(inSrc, browserify);
    return jsTask(bundler, browserifyJsMap[inSrc], false);
  });

  streams.push(
    gulp.src('www/static/js/head.js').pipe(
      rename('head-all.js')
    ).pipe(buffer()).pipe(uglify()).pipe(
      "www/static/js/"
    )
  );

  return merge(streams);
});

gulp.task('js-head', function() {
  return gulp.src('www/static/js/head.js').pipe(
    rename('head-all.js')
  ).pipe(
    gulp.dest("www/static/js/")
  );
});

gulp.task('watch', ['sass', 'js-head'], function() {
  // sass
  gulp.watch('www/static/css/**/*.scss', ['sass']);

  // js
  Object.keys(browserifyJsMap).forEach(function(inSrc) {
    var bundler = makeBundler(inSrc, watchify);
    bundler.on('update', rebundle);
    function rebundle() {
      return jsTask(bundler, browserifyJsMap[inSrc], true);
    }
    rebundle();
  });

  // js-head
  gulp.watch('www/static/js/head.js', ['js-head']);
});

gulp.task('server', function() {
  app.listen(3000);
  tweetdeckProxy.listen(3001);
});

gulp.task('clean', function() {
  gulp.src('build/*', {read: false})
    .pipe(clean());
});

gulp.task('build', ['clean', 'sass-build', 'js-build'], function() {
  throw Error("Not set up yet");
  var server = app.listen(3000);
  var writeStream = gulp.dest('build/');

  writeStream.on('end', server.close.bind(server));

  return urlSrc('http://localhost:3000/app-name/', [
    '',
    'static/css/all.css',
    'static/js/all.js'
  ]).pipe(writeStream);
});

gulp.task('default', ['watch', 'server']);
var express = require('express');
var swig = require('swig');
var path = require('path');

var app = express();

app.engine('html', swig.renderFile);
app.set('view cache', false);
swig.setDefaults({ cache: false });

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.use('/tweetdeck-prototype/static', express.static(__dirname + '/../www/static'));

app.get(RegExp('^/(tweetdeck-prototype)?$'), function(req, res) {
  res.redirect('/tweetdeck-prototype/');
});

app.get('/tweetdeck-prototype/', function(req, res) {
  res.render('../www/index.html');
});

app.get('/tweetdeck-prototype/service-worker.js', function(req, res) {
  res.sendFile(path.resolve('../tweetdeck-prototype/www/static/build/js/sw.js'));
});

module.exports = app;

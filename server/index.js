var express = require('express');
var swig = require('swig');

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

module.exports = app;

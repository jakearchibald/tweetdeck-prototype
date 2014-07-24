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

app.use('/app-name/static', express.static(__dirname + '/../www/static'));

app.get(RegExp('^/(app-name)?$'), function(req, res) {
  res.redirect('/app-name/');
});

app.get('/app-name/', function(req, res) {
  res.render('../www/index.html');
});

module.exports = app;
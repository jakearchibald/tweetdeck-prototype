var https = require('https');
var http = require('http');
var url = require('url');
var TD = {
  host: 'tweetdeck.twitter.com',
  port: 443
};

module.exports = http.createServer(function (req, res) {
  var data = {
    method: req.method,
    host: TD.host,
    port: TD.port,
    path: req.url,
    headers: req.headers
  };

  delete data.headers.host;

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  if (data.headers['access-control-request-headers']) {
    res.setHeader('Access-Control-Allow-Headers', data.headers['access-control-request-headers']);
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
    res.writeHead(200);
    res.end();
    return;
  }

  var tweetdeckReq = https.request(data, function(twres) {
    Object.keys(twres.headers).forEach(function (k) {
      headers[k] = twres.headers[k];
    });
    res.writeHead(twres.statusCode, headers);
    twres.pipe(res);
  });

  tweetdeckReq.on('error', function(e) {
    res.destroy();
  });

  req.pipe(tweetdeckReq);
});

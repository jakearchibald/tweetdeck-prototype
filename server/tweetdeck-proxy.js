var https = require('https');
var http = require('http');
var url = require('url');
var TD = {
  host: 'tweetdeck.twitter.com',
  port: 443
};

module.exports = http.createServer(function (request, response) {
  var data = {
    method: request.method,
    host: TD.host,
    port: TD.port,
    path: request.url,
    headers: request.headers
  };

  delete data.headers.host;

  response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
  if (data.headers['access-control-request-headers']) {
    response.setHeader('Access-Control-Allow-Headers', data.headers['access-control-request-headers']);
  }

  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Max-Age', '86400');
    response.writeHead(200);
    response.end();
    return;
  }

  var tweetdeckReq = https.request(data, function(upstreamResponse) {
    var headers = Object.keys(upstreamResponse.headers).reduce(function (headers, k) {
      headers[k] = upstreamResponse.headers[k];
      return headers;
    }, {});
    response.writeHead(upstreamResponse.statusCode, headers);
    upstreamResponse.pipe(response);
  });

  tweetdeckReq.on('error', function(e) {
    response.destroy();
  });

  request.pipe(tweetdeckReq);
});

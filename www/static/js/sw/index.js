const caches = require('../lib/serviceworker-cache-polyfill');
const Promise = require('../lib/promise');

self.addEventListener('install', function(event) {
   event.waitUntil(
    caches.open('twoffline-static-v7').then(function(cache) {
      return cache.addAll([
        '/tweetdeck-prototype/',
        '/tweetdeck-prototype/static/build/css/all.css',
        '/tweetdeck-prototype/static/build/js/all.js'
      ]);
    })
  )
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request))
  );
});

var validCaches = [
  'twoffline-static-v7'
];

self.addEventListener('activate', function (event) {
  // remove caches beginning "twoffline-" that aren't in
  // validCaches
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (!/^twoffline-/.test(cacheName)) {
            return;
          }
          if (validCaches.indexOf(cacheName) == -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

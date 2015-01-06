var caches = require('../js/lib/serviceworker-cache-polyfill');

self.addEventListener('install', function(event) {
   event.waitUntil(
    caches.open('twoffline-static-v6').then(function(cache) {
      return cache.addAll([
        '/tweetdeck-prototype/static/build/css/all.css',
        '/tweetdeck-prototype/static/build/js/all.js'
      ]);
    })
  )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

var validCaches = [
  'twoffline-static-v6'
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
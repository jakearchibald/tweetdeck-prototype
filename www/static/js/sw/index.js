const caches = require('../lib/serviceworker-cache-polyfill');
const Promise = require('../lib/promise');
const Heap = require('qheap');

const filesToCache = require('./files-to-cache');

self.addEventListener('install', function(event) {
   event.waitUntil(
    caches.open('twoffline-static-v7').then(function(cache) {
      return cache.addAll(filesToCache);
    })
  )
});

class RetryObject {
  constructor(request) {
    this.request = request;
    this.retries = 0;
  }

  inc() {
    return new RetryObject(this.request.clone(), this.retries + 1);
  }
}

class RetryQueue {
  constructor() {
    this.timeout = null;
    this.resetDelay();
    this.queue = new Heap({
      compar: (a, b) => (a.retries <= b.retries ? -1 : 1)
    });
  }

  resetDelay() {
    this.delay = 200;
  }

  run() {
    console.log('RetryQueue: run()', this);
    if (this.queue.length === 0) {
      this.abort();
      return;
    }

    const next = this.queue.shift();
    console.log('RetryQueue: run next=', next);
    // Really stupidly naive implementation. Ignores retry count for now,
    // doesn't work on a per-request basis but globally and only exponentially
    // increases the retry delay without an upper bound.
    const nextPlusOne = next.inc();
    fetch(next.request).then(this.resetDelay.bind(this)).catch(e => {
      console.error('SW Fetch error', e);
      this.delay *= 2;
      this.queue.push(nextPlusOne);
    });
    this.timeout = setTimeout(this.run.bind(this), this.delay);
  }

  abort() {
    console.log('RetryQueue: abort()');
    clearTimeout(this.timeout);
    this.timeout = null;
    this.resetDelay();
  }

  insert(request) {
    this.queue.push(new RetryObject(request.clone()));
    this.run();
  }
}
const retryQueue = new RetryQueue();

// General caching
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.indexOf('/oauth/proxy/twitter/https%3A%2F%2Fapi.twitter.com%2F1.1%2Ffavorites%2Fcreate.json') === 0) {
    console.log('sw', 'is fav', event.request.url);
    const request = event.request.clone();
    event.respondWith(
      fetch(event.request).catch(retryQueue.insert.bind(retryQueue, request))
    );
    return;
  }

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

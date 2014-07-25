// this will appear in the head of the page
// This is a bit hacky & code-golfy.
// The intention here is to get the request out to /clients/blackbird/all as soon as possible.
// That means getting the session from idb then using XHR.
// Deliberately no error recovery going on here, that'll be picked up in tweetdeck.js.
if (window.indexedDB && window.Promise) {
  var initialPrefetch = new Promise(function(resolve, reject) {
    var openRequest = indexedDB.open("tweetdeck", 1);
    openRequest.onsuccess = function(event) {
      var query = openRequest.result.transaction('keyval').objectStore('keyval').get('session');
      query.onsuccess = function(event) {
        var sessionData = query.result;
        if (sessionData) {
          var req = new XMLHttpRequest();
          req.open('GET', '//localhost:3001/clients/blackbird/all');
          req.responseType = 'json';
          req.setRequestHeader("Authorization", 'X-TD-Session ' + sessionData);
          req.onload = function() {
            resolve(req.response);
          };
          req.onerror = reject;
          req.send();
        }
        else {
          reject();
        }
      };
      query.onerror = reject;
    };
    openRequest.onerror = reject;
    openRequest.onupgradeneeded = function(event) {
      // We don't want to handle schema here, we'll leave that to tweetdeck.js.
      // This aborts the upgrade transaction.
      openRequest.transaction.abort();
    };
  });
}

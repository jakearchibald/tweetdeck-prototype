var Tweetdeck = require('./lib/tweetdeck');
var Promise = require('rsvp').Promise;
var utils = require('./lib/utils');
var LoginView = require('./views/Login');
var loginView;

function getLoginView() {
  if (!loginView) {
    loginView = new LoginView();
    document.body.appendChild(loginView.el);
  }
  return loginView;
}

var tweetdeck = new Tweetdeck('//localhost:3001');

function login() {
  var loginView = getLoginView();
  loginView.show();
  return new Promise(function(resolve) {
    loginView.on('submit', function onSubmit(data) {
      loginView.setStatus("Logging in…");
      tweetdeck.login(data.username, data.password).then(function(val) {
        loginView.removeListener('submit', onSubmit);
        loginView.hide();
        resolve(val);
      }).catch(function(err) {
        loginView.removeListener('submit', onSubmit);
        loginView.setStatus("Cannot log in: " + err.message, true);
        return login();
      });
    });
  });
}

tweetdeck.fetchInitialData().catch(function(err) {
  // we only want to handle lack-of-session errors
  if (err.message != "NoSession") {
    throw err;
  }

  return utils.domReady.then(login).then(function() {
    return tweetdeck.fetchInitialData();
  });
}).then(function(initialData) {
  var columnNames = initialData.client.columns.map(function(key) {
    return initialData.columns[key].title;
  });
  var pre = document.createElement('pre');
  pre.appendChild(document.createTextNode("Your columns are:\n" + columnNames.join('\n')));
  document.body.appendChild(pre);
  console.log("Initial data", initialData);
}).catch(utils.promiseDoneErr);


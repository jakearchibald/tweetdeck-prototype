if (window.location.hostname.indexOf('github.io') > -1) {
    module.exports = 'https://twitter-offline-proxy.herokuapp.com';
} else {
    module.exports = '//' + window.location.hostname + ':8001';;
}

var ReactTools = require('react-tools');
var to5 = require('6to5');

module.exports = {
  process: function (src, filename) {
    if (filename.indexOf('node_modules') === -1 && to5.canCompile(filename)) {
      src = to5.transform(src, { filename: filename }).code;
    }
    return ReactTools.transform(src);
  }
};

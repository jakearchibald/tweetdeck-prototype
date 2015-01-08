'use strict';
var DOM = require('react').DOM;

module.exports = function domToReact(el) {
  if (el.nodeType === 3) {
    return el.nodeValue;
  }

  if (el.nodeType !== 1) {
    return '';
  }

  const funcName = el.nodeName.toLowerCase();
  const props = {};

  Array.prototype.forEach.call(el.attributes, function(attribute) {
    const name = (attribute.nodeName === 'class' ? 'className' : attribute.nodeName);
    props[name] = attribute.value;
  });

  const args = [props].concat(
    Array.prototype.filter.call(el.childNodes, el => {
      if (el.nodeType == 3 && !el.nodeValue.trim()) return false;
      return true;
    }).map(domToReact)
  );

  return DOM[funcName].apply(DOM, args);
};

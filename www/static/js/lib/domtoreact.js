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
    Array.prototype.map.call(el.childNodes, domToReact)
  );

  return DOM[funcName].apply(DOM, args);
};

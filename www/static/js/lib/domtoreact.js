var DOM = require('react').DOM;
 
module.exports = function domToReact(el) {
  if (el.nodeType == 3) {
    return el.nodeValue;
  }
 
  if (el.nodeType != 1) {
    return "";
  }
  
  var funcName = el.nodeName.toLowerCase();
  var props = {};
 
  Array.prototype.forEach.call(el.attributes, function(attribute) {
    var name = attribute.nodeName;
    if (name == 'class') {
      name = 'className';
    }
    props[name] = attribute.value;
  });
 
  var args = [props].concat(
    Array.prototype.map.call(el.childNodes, domToReact)
  );
 
  return DOM[funcName].apply(DOM, args);
};
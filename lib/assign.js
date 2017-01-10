"use strict";

const keys = Object.keys;

module.exports = function assign(obj) {
  for (let i = 1; i < arguments.length; i++) {
    let src = arguments[i];
    if (src === undefined || src === null || typeof src !== 'object') continue;
    let keys = Object.keys(src);
    for (let j = 0; j < keys.length; j++) {
      let key = keys[j];
      obj[key] = src[key];
    }
  }
  return obj;
}

"use strict";

const funnel = require('broccoli-funnel');
const findLib = require('./find-lib');

module.exports = function funnelLib(name) {
  let libPath, options;
  if (arguments.length > 2) {
    libPath = arguments[1];
    options = arguments[2];
  } else {
    options = arguments[1];
  }
  return funnel(findLib(name, libPath), options);
}

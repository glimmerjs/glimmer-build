"use strict";

const defaultPlugins = require('./default-es5-plugins');
const Babel = require('broccoli-babel-transpiler');

module.exports = function toES5(tree, _options) {
  let options = Object.assign({}, _options);
  options.plugins = options.plugins || defaultPlugins;
  let babel = new Babel(tree, options);
  // needed until new version published for helpers plugin
  babel.cacheKey = function () {
    let key = Babel.prototype.cacheKey.apply(this, arguments);
    return key + "babel-helpers-version101";
  };
  return babel;
}

"use strict";

const defaultPlugins = require('./default-es5-plugins');
const Babel = require('broccoli-babel-transpiler');

module.exports = function toES5(tree, _babelOptions, buildType) {
  let options = Object.assign({}, _babelOptions);
  options.plugins = options.plugins || defaultPlugins(buildType);
  let babel = new Babel(tree, options);
  // needed until new version published for helpers plugin
  babel.cacheKey = function () {
    let key = Babel.prototype.cacheKey.apply(this, arguments);
    return key + "babel-helpers-version101";
  };
  return babel;
}

"use strict";

const Babel = require('broccoli-babel-transpiler');

module.exports = function toNamedCommonJS(tree) {
  return new Babel(tree, {
    moduleIds: true,
    sourceMap: 'inline',
    plugins: [ 'transform-es2015-modules-commonjs' ]
  });
}

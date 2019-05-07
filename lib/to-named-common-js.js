"use strict";

const Babel = require('broccoli-babel-transpiler');

module.exports = function toNamedCommonJS(tree) {
  return new Babel(tree, {
    moduleIds: true,
    sourceMap: 'inline',
    plugins: [ '@babel/plugin-transform-modules-commonjs' ]
  });
}

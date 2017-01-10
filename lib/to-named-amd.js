"use strict";

const Babel = require('broccoli-babel-transpiler');
const funnel = require('broccoli-funnel');
const moduleResolve = require('amd-name-resolver').moduleResolve;

module.exports = function toNamedAMD(tree) {
  let babel = new Babel(tree, {
    moduleIds: true,
    resolveModuleSource: moduleResolve,
    sourceMap: 'inline',
    plugins: [ 'transform-es2015-modules-amd' ]
  });
  return funnel(babel, {
    destDir: 'named-amd',
    annotation: 'named-amd'
  });
}

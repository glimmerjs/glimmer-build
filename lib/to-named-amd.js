"use strict";

const Babel = require('broccoli-babel-transpiler');
const moduleResolve = require('amd-name-resolver').moduleResolve;
const toNamespacedTree = require('./to-namespaced-tree');

module.exports = function toNamedAMD(tree, namespace) {
  let namespacedTree = toNamespacedTree(tree, namespace);

  return new Babel(namespacedTree, {
    moduleIds: true,
    resolveModuleSource: moduleResolve,
    sourceMap: 'inline',
    plugins: [ 'transform-es2015-modules-amd' ]
  });
}

"use strict";

const Babel = require('broccoli-babel-transpiler');
const moduleResolve = require('amd-name-resolver').moduleResolve;
const toNamespacedTree = require('./to-namespaced-tree');
const getPackageName = require('./get-package-name');
const path = require('path');
const Rollup = require('broccoli-rollup');

module.exports = function toNamedAMD(tree, options = {}) {
  let namespace = options.namespace || getPackageName(process.cwd());
  let plugins = options.plugins || [];
  let entry = options.entry || path.join(namespace, 'index.js');
  let dest = options.dest || path.join('amd', 'es5', namespace.replace(/\//g, '-').replace('@', '') + '.js');
  let external = options.external || [];

  let namespacedTree = toNamespacedTree(tree, namespace);

  return new Rollup(namespacedTree, {
    rollup: {
      entry,
      dest,
      external,
      plugins,
      format: 'amd',
      moduleId: namespace,
      exports: 'named'
    },
    annotation: dest
  });
}

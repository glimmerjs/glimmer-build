"use strict";

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
  let onwarn = options.onwarn || function(warning) {
    // Suppress known error message caused by TypeScript compiled code with Rollup
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    console.log("Rollup warning: ", warning.message);
  };

  let namespacedTree = toNamespacedTree(tree, namespace);

  // TODO: Upgrade broccoli-rollup
  //
  // const rollup = {
  //   entry,
  //   external,
  //   plugins,
  //   onwarn,
  //   output: {
  //     file: dest,
  //     format: 'amd',
  //     exports: 'named',
  //     amd: {
  //       id: namespace,
  //     }
  //   }
  // };

  const rollup = {
    entry,
    dest,
    external,
    plugins,
    onwarn,
    format: 'amd',
    moduleId: namespace,
    exports: 'named'
  };

  return new Rollup(namespacedTree, {
    rollup,
    annotation: dest
  });
}

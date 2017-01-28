"use strict";

const funnel = require('broccoli-funnel');
const getPackageName = require('./get-package-name');

module.exports = function toNamespacedTree(tree, namespace) {
  let packageName = namespace || getPackageName(process.cwd());

  return funnel(tree, { destDir: packageName });
}

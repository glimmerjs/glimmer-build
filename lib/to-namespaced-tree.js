"use strict";

const funnel = require('broccoli-funnel');
const getPackageName = require('./get-package-name');

module.exports = function toNamespacedTree(tree) {
  let projectPath = process.cwd();
  let namespace = getPackageName(projectPath);

  return funnel(tree, { destDir: namespace });
}

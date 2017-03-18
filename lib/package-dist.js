"use strict";

const funnel = require('broccoli-funnel');
const path = require('path');
const resolvePackage = require('./resolve-package');

module.exports = function(name, options = {}) {
  let format = options.format || 'amd';
  let lang = options.lang || 'es5';
  let include = [`dist/${format}/${lang}/**/*.js`];

  return funnel(path.dirname(resolvePackage(`${name}/package.json`)), { include });
}

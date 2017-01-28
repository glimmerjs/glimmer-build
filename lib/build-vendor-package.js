"use strict";

const Funnel = require('broccoli-funnel');
const path = require('path');
const toES5 = require('./to-es5');
const toNamedAmd = require('./to-named-amd');

module.exports = function(name, options) {
  options = options ? options : {};
  let packageJson = require(name + '/package');
  let packageDir = path.dirname(require.resolve(name + '/package'));

  if (options.entry && !options.srcDir) {
    throw new Error('If resolving from a non-package.json entry point, you must supply the srcDirectory.');
  }

  let entryModule = packageJson['module'] || packageJson['jsnext:main'] || packageJson['main'].replace(/dist\//, 'dist/es6/');
  let funnelDir = path.join(packageDir, options.entry ? options.srcDir : path.dirname(entryModule));

  let es6 = new Funnel(funnelDir, { include: ['**/*.js'] });
  let es5Modules = toES5(es6, { sourceMap: 'inline' });
  return toNamedAmd(es5Modules, name);
}

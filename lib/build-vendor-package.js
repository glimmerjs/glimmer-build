"use strict";

const Funnel = require('broccoli-funnel');
const Rollup = require('broccoli-rollup');
const path = require('path');
const toES5 = require('./to-es5');
const resolvePackage = require('./resolve-package');

module.exports = function(name, options) {
  options = options ? options : {};

  let packageJsonPath = resolvePackage(name + '/package.json');

  // Once we've found the target package, load its package.json.
  let packageDir = path.dirname(packageJsonPath);
  let packageJson = require(packageJsonPath);

  if (options.entry && !options.srcDir) {
    throw new Error('If resolving from a non-package.json entry point, you must supply the srcDirectory.');
  }

  let entryModule = packageJson['module'] || packageJson['jsnext:main'] || packageJson['main'].replace(/dist\//, 'dist/es6/');
  let funnelDir = path.join(packageDir, options.entry ? options.srcDir : path.dirname(entryModule));
  let sourceEntry = options.entry ? options.entry : path.basename(entryModule);

  let es6 = new Funnel(funnelDir, { include: ['**/*.js'] });
  let es5 = toES5(es6, { sourceMap: 'inline' });
  let moduleId = options.moduleId ? options.moduleId : name;
  let dest = options.dest ? options.dest + '.js': moduleId + '.js';
  let external = options.external ? options.external : [];
  let plugins = options.plugins ? options.plugins : [];

  const rollup = {
    entry: sourceEntry,
    dest,
    external,
    plugins,
    format: 'amd',
    moduleId,
    exports: 'named'
  };

  // TODO: Upgrade broccoli-rollup
  //
  // const rollup = {
  //   entry: sourceEntry,
  //   external,
  //   plugins,
  //   output: {
  //     file: destination,
  //     format: 'amd',
  //     exports: 'named',
  //     amd: {
  //       id: moduleId
  //     }
  //   }
  // };

  return new Rollup(es5, {
    rollup,
    annotation: dest
  });
}

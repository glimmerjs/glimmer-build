"use strict";

const assert = require('assert');
const compileTypescript = require('./lib/compile-typescript');
const concat = require('broccoli-concat');
const funnel = require('broccoli-funnel');
const funnelLib = require('./lib/funnel-lib');
const getPackageName = require('./lib/get-package-name');
const helpers = require('./lib/generate-helpers');
const mergeTrees = require('broccoli-merge-trees');
const replace = require('broccoli-string-replace');
const toES5 = require('./lib/to-es5');
const toNamedAmd = require('./lib/to-named-amd');
const toNamedCommonJs = require('./lib/to-named-common-js');
const writeFile = require('broccoli-file-creator');

module.exports = function(options) {
  options = options || {};

  let env = process.env.BROCCOLI_ENV;
  let projectPath = process.cwd();
  let projectName = getPackageName(projectPath);

  console.log('Build project:', projectName);
  console.log('Build env:', env);
  console.log('Build path:', projectPath);

  let trees = [];

  if (env === 'tests') {
    trees.push(funnelLib('loader.js', {
      include: ['loader.js'],
      annotation: 'loader.js'
    }));

    trees.push(funnelLib('qunitjs', {
      include: ['qunit.js', 'qunit.css'],
      annotation: 'test/qunit.{js|css}'
    }));

    trees.push(funnel('./node_modules/@glimmer/build/test-support', {
      include: [
        'test-loader.js',
        'index.html'
      ],
      annotation: 'test-support'
    }));

    let babelHelpers = writeFile('babel-helpers.js', helpers('amd'));
    trees.push(babelHelpers);

    let vendorFiles = [
      'node_modules/@glimmer/build/test-support/loader-no-conflict.js'
    ];

    if (options.testDependencies) {
      Array.prototype.push.apply(vendorFiles, options.testDependencies);
    };

    trees.push(concat('./', {
      inputFiles: vendorFiles,
      outputFile: 'vendor.js',
      annotation: 'vendor.js'
    }));

    trees.push(compileTypescript('tsconfig.tests.json', projectPath));
  } else {
    let es2017ModulesAndTypes = compileTypescript('tsconfig.json', projectPath);
    let types = selectTypesFromTree(es2017ModulesAndTypes);
    let es2017Modules = filterTypescriptFromTree(es2017ModulesAndTypes);
    let es5Modules = toES5(es2017Modules, { sourceMap: 'inline' });
    let es5Amd = toNamedAmd(es5Modules);
    let es2017CommonJs = toNamedCommonJs(es2017Modules);
    let es5CommonJs = toNamedCommonJs(es5Modules);

    trees.push(funnel(types, {
      destDir: 'types',
      annotation: 'types'
    }));
    trees.push(funnel(es2017Modules, {
      destDir: 'modules/es2017',
      annotation: 'modules-es2017'
    }));
    trees.push(funnel(es5Modules, {
      destDir: 'modules/es5',
      annotation: 'modules-es5'
    }));
    trees.push(funnel(es5Amd, {
      srcDir: projectName,
      destDir: 'amd/es5',
      annotation: 'amd-es5'
    }));
    trees.push(funnel(es2017CommonJs, {
      destDir: 'commonjs/es2017',
      annotation: 'commonjs-es2017'
    }));
    trees.push(funnel(es5CommonJs, {
      destDir: 'commonjs/es5',
      annotation: 'commonjs-es5'
    }));
  }

  return mergeTrees(trees);
};

function selectTypesFromTree(tree) {
  return funnel(tree, { include: ['**/*.d.ts'] });
}

function filterTypescriptFromTree(tree) {
  return funnel(tree, { exclude: ['**/*.ts'] });
}

"use strict";

const assert = require('assert');
const compileTypescript = require('./lib/compile-typescript');
const concat = require('broccoli-concat');
const funnel = require('broccoli-funnel');
const funnelLib = require('./lib/funnel-lib');
const getPackageName = require('./lib/get-package-name');
const helpers = require('./lib/generate-helpers');
const mergeTrees = require('broccoli-merge-trees');
const path = require('path');
const replace = require('broccoli-string-replace');
const toES5 = require('./lib/to-es5');
const toNamedAmd = require('./lib/to-named-amd');
const toNamedCommonJs = require('./lib/to-named-common-js');
const writeFile = require('broccoli-file-creator');

module.exports = function(options) {
  options = options || {};

  let env = process.env.EMBER_ENV || process.env.BROCCOLI_ENV;
  let isTest = isTestBuild();

  let projectPath = options.projectPath || process.cwd();
  let projectName = getPackageName(projectPath);
  let tsconfigPath = options.tsconfigPath || (isTest ? 'tsconfig.tests.json' : 'tsconfig.json');

  console.log('Build project:', projectName);
  console.log('Build env:', env);
  console.log('Build path:', projectPath);
  console.log('Build tsconfig: ', tsconfigPath);

  let trees = [];

  if (isTest) {
    trees.push(funnelLib('loader.js', {
      include: ['loader.js'],
      annotation: 'loader.js'
    }));

    trees.push(funnelLib('qunitjs', {
      include: ['qunit.js', 'qunit.css'],
      annotation: 'test/qunit.{js|css}'
    }));

    trees.push(funnel(path.join(__dirname, 'test-support'), {
      include: [
        'test-loader.js',
        'index.html'
      ],
      annotation: 'test-support'
    }));

    let babelHelpers = writeFile('babel-helpers.js', helpers('amd'));
    trees.push(babelHelpers);

    let vendorTrees = options.vendorTrees || [];

    vendorTrees = [
      funnel(path.join(__dirname, 'test-support'), { include: ['loader-no-conflict.js'] })
    ];

    if (options.vendorTrees) {
      Array.prototype.push.apply(vendorTrees, options.vendorTrees);
    };

    trees.push(concat(mergeTrees(vendorTrees), {
      inputFiles: ['**/*'],
      outputFile: 'vendor.js',
      sourceMapConfig: { enabled: false },
      annotation: 'vendor.js'
    }));

    let compiledTypescript = compileTypescript(tsconfigPath, projectPath);
    let es2017Modules = filterTypescriptFromTree(compiledTypescript);
    let es5Modules = toES5(es2017Modules);
    let es5Amd = funnel(toNamedAmd(es5Modules), {
      srcDir: projectName
    });

    trees.push(concat(es5Amd, {
      outputFile: 'tests.js'
    }));
  } else {
    let es2017ModulesAndTypes = compileTypescript(tsconfigPath, projectPath);
    let types = selectTypesFromTree(es2017ModulesAndTypes);
    let es2017Modules = filterTypescriptFromTree(es2017ModulesAndTypes);
    let es5Modules = toES5(es2017Modules, { sourceMap: 'inline' });
    let es5Amd = toNamedAmd(es5Modules, projectName);
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

function isTestBuild() {
  return process.env.EMBER_ENV === 'test' || process.env.BROCCOLI_ENV === 'tests';
}
"use strict";

const assert = require('assert');
const compileTypescript = require('./lib/compile-typescript');
const concat = require('broccoli-concat');
const fs = require('fs');
const funnel = require('broccoli-funnel');
const funnelLib = require('./lib/funnel-lib');
const getPackageName = require('./lib/get-package-name');
const mergeTrees = require('broccoli-merge-trees');
const path = require('path');
const replace = require('broccoli-string-replace');
const toES5 = require('./lib/to-es5');
const toNamedAmd = require('./lib/to-named-amd');
const toNamedCommonJs = require('./lib/to-named-common-js');
const buildTestsIndex = require('./lib/build-tests-index');
const writeFile = require('broccoli-file-creator');
const packageDist = require('./lib/package-dist');

module.exports = function(options = {}) {
  let env = process.env.EMBER_ENV || process.env.BROCCOLI_ENV;
  let isTest = isTestBuild();

  let projectPath = options.projectPath || process.cwd();
  let projectName = getPackageName(projectPath);
  let tsconfigPath = options.tsconfigPath || (isTest ? 'tsconfig.tests.json' : 'tsconfig.json');
  let vendorPackages = options.vendorPackages;
  let external = options.external || vendorPackages || [];
  let testOptions = options.test || {};
  let useES5 = testOptions.es5 === undefined || testOptions.es5;

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

    let vendorTrees = options.vendorTrees;
    if (!vendorTrees) {
      vendorTrees = vendorPackages ? vendorPackages.map(packageDist) : [];
    }

    let vendorFile;
    if (vendorTrees.length > 0) {
      vendorFile = concat(mergeTrees(vendorTrees), {
        inputFiles: ['**/*'],
        outputFile: 'vendor.js',
        sourceMapConfig: { enabled: false },
        annotation: 'vendor.js'
      });
    } else {
      vendorFile = writeFile('vendor.js', '');
    }
    trees.push(vendorFile);

    let srcTrees = options.srcTrees;
    let jsTrees = [];
    if (!srcTrees) {
      let srcPath = path.join(projectPath, 'src');
      let testPath = path.join(projectPath, 'test');
      if (fs.existsSync(srcPath) && fs.existsSync(testPath)) {
        let testsIndex = buildTestsIndex('test', 'index.ts');
        srcTrees = [];
        srcTrees.push(funnel(srcPath, { destDir: 'src' }));
        srcTrees.push(funnel(testPath, { destDir: 'test' }));
        srcTrees.push(funnel(testsIndex, { destDir: 'test' }));

        jsTrees.push(funnel(srcPath, {
          destDir: 'src',
          include: ['**/*.js']
        }));
        jsTrees.push(funnel(testPath, {
          destDir: 'test',
          include: ['**/*.js']
        }));
      }
    }

    let compiledTypescript = compileTypescript(
      tsconfigPath,
      projectPath,
      srcTrees
    );

    jsTrees.push(filterTypescriptFromTree(compiledTypescript));
    let modules = mergeTrees(jsTrees);
    if (useES5) {
      modules = toES5(modules, { sourceMap: 'inline' });
    }
    let amd = toNamedAmd(modules, {
      dest: 'tests.js',
      namespace: 'tests',
      entry: path.join('tests', 'test', 'index.js'),
      external
    });
    trees.push(amd);
  } else {
    let srcTrees = options.srcTrees;
    let jsTrees = [];
    if (!srcTrees) {
      let srcPath = path.join(projectPath, 'src');
      if (fs.existsSync(srcPath)) {
        srcTrees = [funnel(srcPath, { destDir: 'src' })];
        jsTrees.push(funnel(srcPath, {
          destDir: 'src',
          include: ['**/*.js']
        }));
      }
    }

    let es2017ModulesAndTypes = compileTypescript(
      tsconfigPath,
      projectPath,
      srcTrees
    );

    jsTrees.push(filterTypescriptFromTree(es2017ModulesAndTypes));
    let es2017Modules = mergeTrees(jsTrees);
    let types = selectTypesFromTree(es2017ModulesAndTypes);
    let es5Modules = toES5(es2017Modules, { sourceMap: 'inline' });
    let es5Amd = toNamedAmd(es5Modules, { namespace: projectName, external });
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
    trees.push(es5Amd);
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

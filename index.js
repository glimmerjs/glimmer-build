"use strict";

const typescript = require('broccoli-typescript-compiler').typescript;
const mergeTrees = require('broccoli-merge-trees');
const assert = require('assert');
const funnel = require('broccoli-funnel');
const concat = require('broccoli-concat');
const fs = require('fs');
const replace = require('broccoli-string-replace');
const writeFile = require('broccoli-file-creator');
const findLib = require('./lib/find-lib');
const funnelLib = require('./lib/funnel-lib');
const getPackageName = require('./lib/get-package-name');
const toNamedAmd = require('./lib/to-named-amd');
const toNamedCommonJs = require('./lib/to-named-common-js');
const toES5 = require('./lib/to-es5');
const helpers = require('./lib/generate-helpers');

module.exports = function(options) {
  options = options || {};

  let env = process.env.BROCCOLI_ENV;
  let projectPath = process.cwd();
  let projectName = getPackageName(projectPath);

  console.log('Build project:', projectName);
  console.log('Build env:', env);
  console.log('Build path:', projectPath);

  let trees = [];

  let tsinclude = [
    'src/**',
    'lib.*.d.ts'
  ];

  if (env === 'tests') {
    tsinclude.push('test/**');
    tsinclude.push('node_modules/@types/**');

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

    trees.push(compileTS('tsconfig.tests.json', projectPath, tsinclude));
  } else {
    let es2017ModulesAndTypings = compileTS('tsconfig.json', projectPath, tsinclude);
    let typings = selectTypingsFromTree(es2017ModulesAndTypings);
    let es2017Modules = filterTypescriptFromTree(es2017ModulesAndTypings);
    let es5Modules = toES5(es2017Modules, { sourceMap: 'inline' });
    let es5Amd = toNamedAmd(es5Modules);
    let es2017CommonJs = toNamedCommonJs(es2017Modules);
    let es5CommonJs = toNamedCommonJs(es5Modules);

    trees.push(funnel(typings, {
      destDir: 'typings',
      annotation: 'typings'
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

function compileTS(tsconfigFile, projectPath, tsinclude) {
  let tsconfig = JSON.parse(fs.readFileSync(tsconfigFile));

  if (tsconfig.compilerOptions.outFile) {
    tsconfig.compilerOptions.outFile = removeFirstPathSegment(tsconfig.compilerOptions.outFile);
  }

  if (tsconfig.compilerOptions.outDir) {
    tsconfig.compilerOptions.outDir = removeFirstPathSegment(tsconfig.compilerOptions.outDir);
  }

  let libs = funnel(findLib('typescript'), {
    include: ['lib.*.d.ts']
  });

  let ts = funnel(mergeTrees([libs, projectPath]), {
    include: tsinclude,
    annotation: 'raw source'
  });

  let compiledTS = typescript(ts, {
    tsconfig,
    annotation: 'compiled source'
  });

  return compiledTS;
}

function selectTypingsFromTree(tree) {
  return funnel(tree, { include: ['**/*.d.ts'] });
}

function filterTypescriptFromTree(tree) {
  return funnel(tree, { exclude: ['**/*.ts'] });
}

function removeFirstPathSegment(path) {
  let parts = path.split('\/');
  parts.shift();
  return parts.join('\/');
}

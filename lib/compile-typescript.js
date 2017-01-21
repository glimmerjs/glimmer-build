"use strict";

const findLib = require('./find-lib');
const fs = require('fs');
const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const typescript = require('broccoli-typescript-compiler').typescript;

module.exports = function compileTypescript(tsconfigFile, projectPath) {
  let tsconfig = JSON.parse(fs.readFileSync(tsconfigFile));

  let libs = funnel(findLib('typescript'), {
    include: ['lib.*.d.ts']
  });

  let ts = funnel(mergeTrees([libs, projectPath]), {
    annotation: 'raw source'
  });

  if (tsconfig.compilerOptions.outFile) {
    tsconfig.compilerOptions.outFile = removeFirstPathSegment(tsconfig.compilerOptions.outFile);
  }

  if (tsconfig.compilerOptions.outDir) {
    tsconfig.compilerOptions.outDir = removeFirstPathSegment(tsconfig.compilerOptions.outDir);
  }

  return typescript(ts, {
    tsconfig,
    annotation: 'compiled source'
  });
};

function removeFirstPathSegment(path) {
  let parts = path.split('\/');
  parts.shift();
  return parts.join('\/');
}

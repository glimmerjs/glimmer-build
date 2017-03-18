"use strict";

const findLib = require('./find-lib');
const fs = require('fs');
const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const path = require('path');
const typescript = require('broccoli-typescript-compiler').typescript;

module.exports = function compileTypescript(tsconfigPath, projectPath, srcTrees) {
  let tsconfig = JSON.parse(fs.readFileSync(tsconfigPath));

  let src = [];

  src.push(funnel(findLib('typescript'), {
    include: ['lib.*.d.ts']
  }));

  if (srcTrees && srcTrees.length > 0) {
    Array.prototype.push.apply(src, srcTrees);
  } else {
    src.push(projectPath);
  }

  let node_modules = path.join(projectPath, 'node_modules');
  if (fs.existsSync(node_modules)) {
    src.push(funnel(node_modules, {
      destDir: 'node_modules'
    }));
  }

  let ts = funnel(mergeTrees(src), {
    annotation: 'TypeScript Source'
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

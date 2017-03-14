"use strict";

const findLib = require('./find-lib');
const fs = require('fs');
const funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const path = require('path');
const typescript = require('broccoli-typescript-compiler').typescript;

module.exports = function compileTypescript(tsconfigFile, projectPath, srcDirs = ['src']) {
  let tsconfig = JSON.parse(fs.readFileSync(tsconfigFile));

  let libs = funnel(findLib('typescript'), {
    include: ['lib.*.d.ts']
  });

  let sources = [libs];

  srcDirs.forEach(srcDir => {
    sources.push(funnel(path.join(projectPath, srcDir), {
      include: ['**/*.ts', '**/*.d.ts'],
      destDir: srcDir
    }));
  });

  let ts = funnel(mergeTrees(sources), {
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

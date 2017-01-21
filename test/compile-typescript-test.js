"use strict";

const broccoli = require('broccoli');
const expect = require('chai').expect;
const compileTypescript = require('../lib/compile-typescript');
const fixturify = require('fixturify');
const fs = require('fs');
const funnel = require('broccoli-funnel');
const path = require('path');
const rimrafSync = require('rimraf').sync;
const walkSync = require('walk-sync');

const TMP_DIR = path.join(__dirname, '../tmp/compile-typescript');

let builder;

describe('compile-typescript', function() {
  afterEach(function() {
    teardown();
  });

  describe('when no outDir or outFile are specified', function() {
    beforeEach(function() {
      setup({
        compilerOptions: {},
        include: [
          'src/**/*.ts'
        ]
      });
    });

    it('compiles typescript', function() {
      let tsconfigFile = path.join(TMP_DIR, 'tsconfig.json');
      let projectPath = TMP_DIR;
      let compiledTypescript = compileTypescript(tsconfigFile, projectPath);

      builder = new broccoli.Builder(compiledTypescript);

      return builder.build().then(() => {
        expect(walkSync(builder.outputPath)).to.eql(['src/', 'src/foo.js']);
      });
    });
  });

  describe('when outDir is specified', function() {
    beforeEach(function() {
      setup({
        compilerOptions: {
          outDir: 'dist/lib'
        },
        include: [
          'src/**/*.ts'
        ]
      });
    });

    it('compiles typescript into shifted outDir', function() {
      let tsconfigFile = path.join(TMP_DIR, 'tsconfig.json');
      let projectPath = TMP_DIR;
      let compiledTypescript = compileTypescript(tsconfigFile, projectPath);

      builder = new broccoli.Builder(compiledTypescript);

      return builder.build().then(() => {
        expect(walkSync(builder.outputPath)).to.eql(['lib/', 'lib/foo.js']);
      });
    });
  });

  describe('when outFile is specified', function() {
    beforeEach(function() {
      setup({
        compilerOptions: {
          outFile: 'dist/lib/foo.js'
        },
        include: [
          'src/**/*.ts'
        ]
      });
    });

    it('compiles typescript into shifted outFile', function() {
      let tsconfigFile = path.join(TMP_DIR, 'tsconfig.json');
      let projectPath = TMP_DIR;
      let compiledTypescript = compileTypescript(tsconfigFile, projectPath);

      builder = new broccoli.Builder(compiledTypescript);

      return builder.build().then(() => {
        expect(walkSync(builder.outputPath)).to.eql(['lib/', 'lib/foo.js']);
      });
    });
  });
});

function setup(tsconfig) {
  fixturify.writeSync(TMP_DIR, {
    'tsconfig.json': JSON.stringify(tsconfig),
    'src': {
      'foo.ts': ''
    }
  });
}

function teardown() {
  rimrafSync(TMP_DIR);
  if (builder) {
    return builder.cleanup();
  }
}

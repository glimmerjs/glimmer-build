'use strict';

const expect = require('chai').expect;
const findLib = require('../lib/find-lib');
const fixturify = require('fixturify');
const path = require('path');
const rimrafSync = require('rimraf').sync;

const NODE_MODULES_PATH = path.join(__dirname, '../node_modules');

describe('find-lib', function() {
  describe('when `main` is defined in package.json', function() {
    beforeEach(function() {
      setupFakePackage({ main: 'dist/whatever.js' });
    });

    afterEach(function() {
      teardownFakePackage();
    });

    it('finds directory of the `main` file of the given dependency', function() {
      let foundLib = findLib('foo');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'dist'));
    });

    it('finds directory of given dependency with optional libPath', function() {
      let foundLib = findLib('foo', 'bar');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'bar'));
    });
  });

  describe('when `module` is defined in package.json', function() {
    beforeEach(function() {
      setupFakePackage({ module: 'lib/whatever.js' });
    });

    afterEach(function() {
      teardownFakePackage();
    });

    it('finds directory of the `module` file of the given dependency', function() {
      let foundLib = findLib('foo');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'lib'));
    });

    it('finds directory of given dependency with optional libPath', function() {
      let foundLib = findLib('foo', 'bar');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'bar'));
    });
  });

  describe('when `main` and `module` are defined in package.json', function() {
    beforeEach(function() {
      setupFakePackage({
        main: 'dist/whatever.js',
        module: 'lib/whatever.js'
      });
    });

    afterEach(function() {
      teardownFakePackage();
    });

    it('finds directory of the `module` file of the given dependency', function() {
      let foundLib = findLib('foo');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'lib'));
    });

    it('finds directory of given dependency with optional libPath', function() {
      let foundLib = findLib('foo', 'bar');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'bar'));
    });
  });
});

function setupFakePackage(packageJson) {
  fixturify.writeSync(path.join(NODE_MODULES_PATH, 'foo'), {
    'package.json': JSON.stringify(packageJson)
  });
}

function teardownFakePackage() {
  delete require.cache[require.resolve('foo/package')];
  rimrafSync(path.join(NODE_MODULES_PATH, 'foo'));
}

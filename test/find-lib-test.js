'use strict';

const expect = require('chai').expect;
const findLib = require('../lib/find-lib');
const fixturify = require('fixturify');
const path = require('path');
const rimrafSync = require('rimraf').sync;

const NODE_MODULES_PATH = path.join(__dirname, '../node_modules');

describe('find-lib', function() {
  describe('when module is not defined in package.json', function() {
    beforeEach(function() {
      setupFakePackage({ main: 'lib/whatever.js' });
    });

    afterEach(function() {
      teardownFakePackage();
    });

    it('finds directory for given dependency', function() {
      let foundLib = findLib('foo');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'lib'));
    });

    it('finds directory for given dependency with optional libPath', function() {
      let foundLib = findLib('foo', 'bar');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'bar'));
    });
  });

  describe('when module is defined in package.json', function() {
    beforeEach(function() {
      setupFakePackage({ module: 'dist/whatever.js' });
    });

    afterEach(function() {
      teardownFakePackage();
    });

    it('finds module directory for given dependency when module is defined in package.json', function() {
      let foundLib = findLib('foo');

      expect(foundLib).to.eq(path.join(NODE_MODULES_PATH, 'foo', 'dist'));
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

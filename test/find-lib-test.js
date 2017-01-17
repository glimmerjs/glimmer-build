'use strict';

const expect = require('chai').expect;
const findLib = require('../lib/find-lib');
const path = require('path');
const fs = require('fs');
const rimrafSync = require('rimraf').sync;

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

      expect(foundLib).to.eq(path.join(__dirname, '..', 'node_modules', 'foo', 'lib'));
    });

    it('finds directory for given dependency with optional libPath', function() {
      let foundLib = findLib('foo', 'bar');

      expect(foundLib).to.eq(path.join(__dirname, '..', 'node_modules', 'foo', 'bar'));
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

      expect(foundLib).to.eq(path.join(__dirname, '..', 'node_modules', 'foo', 'dist'));
    });
  });
});

function setupFakePackage(packageJson) {
  fs.mkdirSync(path.join(__dirname, '../node_modules/foo'));
  fs.writeFileSync(path.join(__dirname, '../node_modules/foo/package.json'), JSON.stringify(packageJson));
}

function teardownFakePackage() {
  delete require.cache[require.resolve('foo/package')];
  rimrafSync(path.join(__dirname, '../node_modules/foo'));
}

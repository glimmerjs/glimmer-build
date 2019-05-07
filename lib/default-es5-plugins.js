"use strict";

let stripGlimmerUtils = require('babel-plugin-strip-glimmer-utils');
let debugMacros = require('babel-plugin-debug-macros');

module.exports = function(buildType) {
  return [
    ['@babel/transform-template-literals', {loose: true}],
    ['@babel/transform-arrow-functions'],
    ['@babel/transform-destructuring', {loose: true}],
    ['@babel/transform-spread', {loose: true}],
    ['@babel/transform-parameters'],
    ['@babel/transform-computed-properties', {loose: true}],
    ['@babel/transform-shorthand-properties'],
    ['@babel/plugin-transform-block-scoping'],
    ['@babel/plugin-transform-proto-to-assign'],
    ['@babel/plugin-transform-classes', {loose: true}],
    ['check-es2015-constants'],
    _envFlags(buildType),
    [stripGlimmerUtils, {
      bindings: ['expect', 'unwrap'],
      source: '@glimmer/util'
    }]
  ]
}

function _envFlags(buildType) {
  return [debugMacros, {
    flags: [{
      source: '@glimmer/local-debug-flags',
      flags: { DEBUG: buildType !== 'production', CI: !!process.env.CI }
    }],
    debugTools: {
      isDebug: true,
      source: '@glimmer/debug'
    },
    externalizeHelpers: {
      module: true
    }
  }];
}

module.exports.envFlags = _envFlags;

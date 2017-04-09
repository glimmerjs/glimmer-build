"use strict";

let stripGlimmerUtils = require('babel-plugin-strip-glimmer-utils');
let debugMacros = require('babel-plugin-debug-macros')['default'];

module.exports = function() {
  return [
    ['transform-es2015-template-literals', {loose: true}],
    ['transform-es2015-arrow-functions'],
    ['transform-es2015-destructuring', {loose: true}],
    ['transform-es2015-spread', {loose: true}],
    ['transform-es2015-parameters'],
    ['transform-es2015-computed-properties', {loose: true}],
    ['transform-es2015-shorthand-properties'],
    ['transform-es2015-block-scoping'],
    ['check-es2015-constants'],
    ['transform-es2015-classes', {loose: true}],
    ['transform-proto-to-assign'],
    [debugMacros, {
      envFlags: {
        source: '@glimmer/env-flags',
        flags: { DEBUG: false }
      },
      debugTools: {
        source: '@glimmer/debug'
      },
      externalizeHelpers: {
        module: true
      }
    }],
    [stripGlimmerUtils, {
      bindings: ['expect', 'unwrap'],
      source: '@glimmer/util'
    }]
  ]
}

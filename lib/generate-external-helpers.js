"use strict";

const get = require('babel-helpers').default;
const generate = require('babel-generator').default;
const t = require('babel-types');

const REGEX = /if \(superClass\) Object\.setPrototypeOf \?[^;]*;/
const REPLACE = 'if(superClass)if(Object.setPrototypeOf)Object.setPrototypeOf(subClass,superClass);else for(var p in superClass)superClass.hasOwnProperty(p)&&(subClass[p]=superClass[p]);'

let HELPERS = [
  'taggedTemplateLiteralLoose',
  'possibleConstructorReturn',
  'inherits',
  'createClass',
  'classCallCheck'
].map(function (name) {
  let ast = get(name);
  ast.id = t.identifier(name);
  let code = generate(ast).code;

  if (name === 'inherits') {
    // IE 9 and 10 fix
    code = code.replace(/if \(superClass\) Object\.setPrototypeOf \?[^;]*;/, REPLACE);
  }
  return {
    name: name,
    code: code
  }
});

module.exports = function helpers(format) {
  let code = HELPERS.map(function (helper) {
    if (format === 'es') {
      return 'export let ' + helper.name + ' = ' + helper.code;
    }
    return 'exports.' + helper.name + " = " + helper.code;
  }).join('\n');
  if (format === 'amd') {
    code = 'define(\'babel-helpers\', [\'exports\'], function (exports) {\n' + code + '\n});\n';
  }
  return code;
}

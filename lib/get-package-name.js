 "use strict";

const fs = require('fs');
const path = require('path');

module.exports = function(projectPath) {
  return JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'))).name;
}

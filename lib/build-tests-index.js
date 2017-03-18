const walkSync = require('walk-sync');
const writeFile = require('broccoli-file-creator');

module.exports = function buldTestsIndex(inputDir, destFile) {
  let modules = [];
  let paths = walkSync(inputDir);
  paths.forEach(path => {
    if (path.indexOf('-test.') > -1) {
      let name = path.split('.')[0];
      modules.push(name);
    }
  });

  let imports = modules.map(module => {
    return `import "./${module}";`;
  });
  let contents = imports.join('\n');

  return writeFile(destFile, contents);
}

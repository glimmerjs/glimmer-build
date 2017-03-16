"use strict";

function ImportExternalHelpersPlugin() {
  return {
    name: 'import-external-helpers',
    pre: function (file) {
      file.set('helperGenerator', function (name) {
        return file.addImport('babel-helpers', name, name);
      });
    }
  };
}

ImportExternalHelpersPlugin.baseDir = function() { return process.cwd(); };

module.exports = ImportExternalHelpersPlugin;
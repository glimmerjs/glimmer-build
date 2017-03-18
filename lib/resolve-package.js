const resolve = require('resolve');
const stackTrace = require('stack-trace');
const path = require('path');

module.exports = function(name) {
  // To support npm linking `@glimmer/build`, look for the given vendor package
  // from the caller's file system location, not ours.
  let callerPath = pathToCaller();
  return resolve.sync(name, {
    basedir: callerPath
  });
}

function pathToCaller() {
  let stackFrame = stackTrace.get()[3];
  let stackFrameFile = stackFrame.getFileName();
  return path.dirname(stackFrameFile);
}
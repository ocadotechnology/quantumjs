'use strict'
/*

  Main
  ====

  This is the library entry point. This simply collects together the various apis
  defined in other files.

*/

module.exports = {
  File: require('./File'),
  FileInfo: require('./FileInfo'),
  Selection: require('./select').Selection,
  parse: require('./parse'),
  stringify: require('./stringify'),
  read: require('./read').read,
  readAsFile: require('./read').readAsFile,
  write: require('./write'),
  select: require('./select'),
  json: require('./json'),
  // fileOptions: require('./fileOptions'),
  watch: require('./watch'),
  cli: require('./cli'),
  clone: require('./clone')
}

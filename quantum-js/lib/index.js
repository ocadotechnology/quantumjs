'use strict'
/*

  Main
  ====

  This is the library entry point. This simply collects together the various apis
  defined in other files.

*/

module.exports = {
  File: require('./file'),
  FileInfo: require('./file-info'),
  Selection: require('./select').Selection,
  parse: require('./parse'),
  stringify: require('./stringify'),
  read: require('./read'),
  write: require('./write'),
  select: require('./select'),
  json: require('./json'),
  // fileOptions: require('./file-options'),
  watch: require('./watch'),
  cli: require('./cli'),
  clone: require('./clone')
}

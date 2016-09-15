'use strict'
/*

  Main
  ====

  This is the library entry point. This simply collects together the various apis
  defined in other files.

*/

module.exports = {
  File: require('./file'),
  Page: require('./page'),
  parse: require('./parse'),
  stringify: require('./stringify'),
  read: require('./read'),
  select: require('./select'),
  json: require('./json'),
  fileOptions: require('./file-options'),
  watch: require('./watch'),
  cli: require('./cli'),
  clone: require('./clone')
}

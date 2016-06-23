/*

     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

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

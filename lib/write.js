/*

     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Write
  =====

  Writes a string to file. This doesn't do anything special, it just
  provides some symmetry when using the read api:

    quantum.read('file.um')
      .map(html())
      .map(quantum.write('target'))

*/

var Promise = require('bluebird')
var fs      = Promise.promisifyAll(require('fs'))

module.exports = function(directory, data) {
  if(arguments.length > 1) {
    return fs.writeFileAsync(path.join(directory, data.filename), data.content)
  } else {
    return function(data) {
      return fs.writeFileAsync(path.join(directory, data.filename), data.content)
    }
  }
}
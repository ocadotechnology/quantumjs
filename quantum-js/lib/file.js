/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  File
  ====

  Stores information about where a file / page came from and where it is going
  to be written to.

*/

function File (options) {
  this.src = options.src
  this.resolved = options.resolved
  this.base = options.base
  this.dest = options.dest
  this.watch = options.watch
}

File.prototype = {
  /* Changes the extension of the dest property - returns a new File */
  withExtension: function (extension) {
    return this.clone({
      dest: this.dest.replace('.um', extension)
    })
  },
  /* returns a new File with the specified properties changed */
  clone: function (changes) {
    return new File({
      src: changes && changes.src !== undefined ? changes.src : this.src,
      resolved: changes && changes.resolved !== undefined ? changes.resolved : this.resolved,
      base: changes && changes.base !== undefined ? changes.base : this.base,
      dest: changes && changes.dest !== undefined ? changes.dest : this.dest,
      watch: changes && changes.watch !== undefined ? changes.watch : this.watch
    })
  }
}

module.exports = File

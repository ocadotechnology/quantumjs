'use strict'
/*

  FileInfo
  ====

  Stores information about where a file / page came from and where it is going
  to be written to.

*/

function FileInfo (options) {
  this.src = options.src
  this.resolved = options.resolved
  this.base = options.base
  this.dest = options.dest
  this.destBase = options.destBase
  this.watch = options.watch
}

FileInfo.prototype = {
  /* Changes the extension of the dest property - returns a new FileInfo */
  withExtension: function (extension) {
    return this.clone({
      dest: this.dest.replace('.um', extension)
    })
  },
  /* Returns a new FileInfo with the specified properties changed */
  clone: function (changes) {
    return new FileInfo({
      src: changes && changes.src !== undefined ? changes.src : this.src,
      resolved: changes && changes.resolved !== undefined ? changes.resolved : this.resolved,
      base: changes && changes.base !== undefined ? changes.base : this.base,
      dest: changes && changes.dest !== undefined ? changes.dest : this.dest,
      destBase: changes && changes.destBase !== undefined ? changes.destBase : this.destBase,
      watch: changes && changes.watch !== undefined ? changes.watch : this.watch
    })
  }
}

module.exports = FileInfo

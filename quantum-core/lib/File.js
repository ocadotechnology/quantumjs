'use strict'
/*

  File
  ====

  Represents a file or html page as it passes through the quantum pipeline.

  A page contains a reference to the source file, and the destination file it
  will be written to, the content (which can contain the parsed ast, virtual
  dom, or html depending on which part of the pipeline you are at), and a meta
  object, which can contain other information which is collected up as the page
  is built. An example of some meta information is the version number of the page
  which is added by quantum-version when expanding a single source page into multiple
  versioned pages.

*/

const merge = require('merge')

function File (options) {
  this.info = options.info
  this.content = options.content || []
  this.meta = options.meta || {}
  this.warnings = options.warnings || []
  this.errors = options.errors || []
}

File.prototype = {
  clone: function (changes) {
    return new File({
      info: changes && changes.info !== undefined ? changes.info : this.info,
      content: changes && changes.content !== undefined ? changes.content : this.content,
      meta: changes && changes.meta !== undefined ? merge.recursive({}, this.meta, changes.meta) : this.meta,
      warnings: changes && changes.warnings !== undefined ? changes.warnings.slice() : this.warnings.slice(),
      errors: changes && changes.errors !== undefined ? changes.errors.slice() : this.errors.slice()
    })
  },
  warning: function (warning) {
    this.warnings.push(warning)
  },
  error: function (errors) {
    this.errors.push(errors)
  }
}

module.exports = File

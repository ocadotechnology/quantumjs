/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Page
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

function Page (options) {
  this.file = options.file
  this.content = options.content || []
  this.meta = options.meta || {}
  this.warnings = options.warnings || []
  this.errors = options.errors || []
}

Page.prototype = {
  clone: function (changes) {
    return new Page({
      file: changes && changes.file !== undefined ? changes.file : this.file,
      content: changes && changes.content !== undefined ? changes.content : this.content,
      meta: changes && changes.meta !== undefined ? merge.recursive({}, this.meta, changes.meta) : this.meta,
      warnings: changes && changes.warnings !== undefined ? changes.warnings : this.warnings,
      errors: changes && changes.errors !== undefined ? changes.errors : this.errors
    })
  },
  warning: function (warning) {
    this.warnings.push(warning)
  },
  error: function (errors) {
    this.errors.push(errors)
  }
}

module.exports = Page

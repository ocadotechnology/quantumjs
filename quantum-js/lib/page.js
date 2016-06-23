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

var merge = require('merge')

function Page (options) {
  this.file = options.file
  this.content = options.content
  this.meta = {}
}

Page.prototype = {
  clone: function (changes) {
    return new Page({
      file: changes.file !== undefined ? changes.file : this.file,
      content: changes.content !== undefined ? changes.content : this.content,
      meta: changes.meta !== undefined ? merge.recursive(this.meta, changes.meta) : this.meta
    })
  }
}

module.exports = Page

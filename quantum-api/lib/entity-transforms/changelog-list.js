'use strict'

const dom = require('quantum-dom')

/*
  A changelogList for multiple @changelog entries. Also used by the page entry as a
  place to generate @changelog entries in.
*/
module.exports = function changelogList (options) {
  return (selection, transformer) => {
    return dom.create('div').class('qm-changelog-list')
      .add(selection.filter('changelog').transform(transformer))
  }
}

'use strict'
/*

  Write
  ====

  Writes a page or an array of pages.

*/

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const flatten = require('flatten')

function write (pages) {
  return Promise.all(Array.isArray(pages) ? flatten(pages) : [pages])
    .map((page) => fs.outputFileAsync(page.file.dest, page.content).then(() => page))
}

module.exports = write

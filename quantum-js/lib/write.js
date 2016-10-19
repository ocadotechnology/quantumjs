'use strict'
/*

  Write
  ====

  Writes a file or an array of files.

*/

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const flatten = require('flatten')

function write (file) {
  return Promise.all(Array.isArray(file) ? flatten(file) : [file])
    .map((page) => fs.outputFileAsync(page.file.dest, page.content).then(() => page))
}

module.exports = write

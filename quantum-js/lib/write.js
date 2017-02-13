'use strict'
/*

  Write
  ====

  Writes a page or an array of files.

*/

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const flatten = require('flatten')

function write (files) {
  return Promise.all(Array.isArray(files) ? flatten(files) : [files])
    .map(file => fs.outputFileAsync(file.info.dest, file.content).then(() => file))
}

module.exports = write

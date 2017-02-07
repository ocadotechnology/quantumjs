'use strict'
const read = require('./read').read
const File = require('./file')

// Takes a fileInfo and returns a File after reading in the content
function defaultFileLoader (fileInfo, fileReader) {
  return read(fileInfo.src, { fileReader })
    .then(content => new File({ info: fileInfo, content }))
}

module.exports = {
  defaultFileLoader
}

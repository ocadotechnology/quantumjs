'use strict'

const header = require('../components/header')

/* Wraps a details section in a header */
module.exports = function headerBuilder (type, detailsBuilder, typeLinks) {
  return (selection, transformer) => {
    const details = detailsBuilder(selection, transformer)
    return header(type, details, selection, transformer)
  }
}

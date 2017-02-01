'use strict'

const dom = require('quantum-dom')

module.exports = function group (options) {
  const builders = (options || {}).builders || []
  return (selection, transformer) => {
    return dom.create('div')
      .class('qm-api-group')
      .add(builders.map(builder => builder(selection, transformer)))
  }
}

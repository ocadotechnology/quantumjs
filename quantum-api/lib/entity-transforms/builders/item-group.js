'use strict'

const dom = require('quantum-dom')
const utils = require('../../utils')

/* Creates a group of items (like all the methods on a prototype, or all the properties on an object) */
module.exports = function itemGroupBuilder (type, title, options) {
  return (selection, transformer) => {
    const hasType = Array.isArray(type) ? type.some(t => selection.has(t)) : selection.has(type)

    if (hasType) {
      const filtered = selection.filter(type)
      const organised = utils.organisedEntity(filtered, options)

      // deals with optional types  (e.g. ['param', 'param?'])
      const firstType = Array.isArray(type) ? type[0] : type

      return dom.create('div').class('qm-api-' + firstType + '-group')
        .add(dom.create('h2').text(title))
        .add(organised.transform(transformer))
    }
  }
}

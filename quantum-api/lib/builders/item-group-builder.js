'use strict'

const dom = require('quantum-dom')
const organisedEntity = require('../utils/organised-entity').organisedEntity

/* Creates a group of items (like all the methods on a prototype, or all the properties on an object) */
module.exports = function itemGroupBuilder (type, title, options) {
  return (selection, transforms) => {
    const hasType = Array.isArray(type) ? type.some(t => selection.has(t)) : selection.has(type)

    if (hasType) {
      const filtered = selection.filter(type)
      const organised = organisedEntity(filtered, options)

      // deals with optional types  (e.g. ['param', 'param?'])
      const firstType = Array.isArray(type) ? type[0] : type

      return dom.create('div').class('qm-api-' + firstType + '-group')
        .add(dom.create('h2').text(title))
        .add(organised.transform(transforms))
    }
  }
}

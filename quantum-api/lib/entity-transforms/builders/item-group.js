'use strict'

const dom = require('quantum-dom')
const utils = require('../../utils')

function typeFilter (language, type) {
  return (entity) => {
    const entityType = entity.type
    if (entityType) {
      const dotIndex = entityType.indexOf('.')
      const isArray = Array.isArray(type)
      if (dotIndex > -1) {
        const nameWithoutRoot = entityType.slice(dotIndex + 1)
        if (isArray) {
          return type.map(t => `${language}.${t}`).includes(nameWithoutRoot)
        } else {
          return nameWithoutRoot === `${language}.${type}`
        }
      } else {
        return isArray ? type.includes(entityType) : type === entityType
      }
    }
  }
}

/* Creates a group of items (like all the methods on a prototype, or all the properties on an object) */
module.exports = function itemGroupBuilder (language, type, title, options) {
  return (selection, transformer) => {
    // deals with optional types  (e.g. ['param', 'param?'])
    const filtered = selection.filter(typeFilter(language, type))
    if (filtered.hasContent()) {
      const firstType = Array.isArray(type) ? type[0] : type
      const organised = utils.organisedEntity(filtered, options)
      return dom.create('div').class('qm-api-' + firstType + '-group')
        .add(dom.create('h2').text(title))
        .add(organised.transform(transformer))
    }
  }
}

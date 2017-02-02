'use strict'

const path = require('path')
const dom = require('quantum-dom')
const header = require('../entity-transforms/builders/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-api-quantum.css',
    file: path.join(__dirname, '../../assets/languages/quantum-api-quantum.css'),
    shared: true
  })
]

function nameHeaderDetails (type) {
  return (selection, transformer) => {
    return dom.create('span')
      .class(`qm-api-quantum-${type}-header-name`)
      .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
      .add(selection.param(0))
  }
}

const entityHeader = header('entity', nameHeaderDetails('entity'))
const paramHeader = header('param', nameHeaderDetails('param'))

const description = body.description
const extras = body.extras
const groups = body.groups
const entities = itemGroup('quantum', 'entity', 'Entities')
const params = itemGroup('quantum', 'param', 'Parameters')

const entityBuilder = item({
  class: 'qm-api-quantum-entity',
  header: entityHeader,
  content: [ description, extras, groups, entities, params ]
})

const paramBuilder = item({
  class: 'qm-api-quantum-param',
  header: paramHeader,
  content: [ description, extras, groups ]
})

module.exports = (options) => {
  return {
    assets,
    name: 'quantum',
    transforms: {
      entity: entityBuilder,
      param: paramBuilder
    },
    changelogHeaderTransforms: {
      entity: entityHeader,
      param: paramHeader
    }
  }
}

module.exports.entities = entities
module.exports.params = params

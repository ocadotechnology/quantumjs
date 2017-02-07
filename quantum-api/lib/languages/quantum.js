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

function paramHeaderDetails (selection, transformer) {
  return dom.create('span')
    .class(`qm-api-quantum-param-header-name`)
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(selection.param(0))
}

function entityHeaderDetails (selection, transformer) {
  const params = selection.selectAll(['param', 'param?']).map((param) => {
    const isOptional = param.type()[param.type().length - 1] === '?'
    return dom.create('span')
      .class('qm-api-quantum-param-header-name')
      .classed('qm-api-optional', isOptional)
      .add(dom.create('span').class('qm-api-quantum-header-entity-param-name').text(param.param(0)))
  })

  return dom.create('span')
    .class(`qm-api-quantum-header-entity-name`)
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(selection.param(0))
    .add(dom.create('span').class('qm-api-quantum-header-entity-params').add(params))
}

const entityHeader = header('entity', entityHeaderDetails)
const paramHeader = header('param', paramHeaderDetails)

const description = body.description
const extras = body.extras
const groups = body.groups
const entities = itemGroup('quantum', 'entity', 'Entities')
const params = itemGroup('quantum', ['param', 'param?'], 'Parameters')

const entityBuilder = item({
  class: 'qm-api-quantum-entity',
  header: entityHeader,
  content: [ description, extras, params, groups, entities ]
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

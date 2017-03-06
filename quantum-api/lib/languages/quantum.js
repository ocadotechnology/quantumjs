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
    filename: path.join(__dirname, '../../assets/languages/quantum-api-quantum.css'),
    shared: true
  })
]

function paramHeaderDetails (selection, transformer) {
  const name = selection.param(0)
  return dom.create('span')
    .class('qm-api-quantum-header-param-name')
    .attr('id', name ? name.toLowerCase() : undefined)
    .add(name || '')
}

function entityHeaderParamDetails (selection, transformer) {
  const name = selection.param(0)
  const isOptional = selection.type()[selection.type().length - 1] === '?'
  return dom.create('span')
    .class('qm-api-quantum-header-entity-param')
    .classed('qm-api-optional', isOptional)
    .add(dom.create('span').class('qm-api-quantum-header-entity-param-name')
      .text(name || ''))
}

function entityHeaderDetails (selection, transformer) {
  const name = selection.param(0)
  const params = selection.selectAll(['param', 'param?']).map((param) => entityHeaderParamDetails(param, transformer))
  const paramsContent = params.length ?
    dom.create('span').class('qm-api-quantum-header-entity-params').add(params) :
    undefined

  return dom.create('span')
    .class('qm-api-quantum-header-entity-name')
    .attr('id', name ? name.toLowerCase() : undefined)
    .add(name || '')
    .add(paramsContent)
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

function createHeaderDom (changelogHeaders) {
  const entityTypes = Object.keys(changelogHeaders)
  return (selection, transformer) => {
    if (entityTypes.some(entityType => selection.has(entityType))) {
      let current = selection
      const sections = []
      while (entityTypes.some(entityType => current.has(entityType))) {
        current = current.select(entityTypes)
        const type = current.type()
        const baseType = type.replace('?', '')

        const section = dom.create('span')
          .class(`qm-changelog-quantum-${baseType}`)
          .add(changelogHeaders[type](current, transformer))

        sections.push(section)
      }
      return dom.create('span')
        .class('qm-changelog-quantum-header')
        .add(sections)
    }
  }
}

module.exports = (options) => {
  const changelogHeaderTransforms = {
    entity: entityHeader
  }

  return {
    assets,
    name: 'quantum',
    transforms: {
      entity: entityBuilder,
      param: paramBuilder
    },
    changelog: {
      entityTypes: Object.keys(changelogHeaderTransforms),
      createHeaderDom: createHeaderDom(changelogHeaderTransforms)
    }
  }
}

module.exports.entities = entities
module.exports.params = params

'use strict'

const path = require('path')
const dom = require('quantum-dom')
const header = require('../entity-transforms/builders/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')
const createLanguage = require('../create-language.js')

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
const assetHeader = header('asset', nameHeaderDetails('extra-class'))

const description = body.description
const extras = body.extras
const groups = body.groups
const entities = itemGroup('entity', 'Entities')
const params = itemGroup('param', 'Parameters')

const entityBuilder = item({
  class: 'qm-api-quantum-entity',
  header: entityHeader,
  content: [ description, extras, groups, entities, params ]
})

const paramBuilder = item({
  class: 'qm-api-quantum-asset',
  header: assetHeader,
  content: [ description, extras, groups ]
})

/* The config for building css api docs */
function getTransforms (options) {
  return {
    api: {
      entity: entityBuilder,
      param: paramBuilder
    },
    changelog: {
      entity: entityHeader,
      param: assetHeader
    }
  }
}

module.exports = (options) => {
  return createLanguage('quantum', getTransforms, options, assets)
}

module.exports.entities = entities

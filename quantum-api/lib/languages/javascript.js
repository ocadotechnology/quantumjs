'use strict'

const path = require('path')
const dom = require('quantum-dom')
const type = require('../entity-transforms/components/type')
const header = require('../entity-transforms/builders/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-api-javascript.css',
    file: path.join(__dirname, '../../assets/languages/quantum-api-javascript.css'),
    shared: true
  })
]

const description = body.description
const groups = body.groups
const extras = body.extras
const defaultValue = body.default
const prototypes = itemGroup('prototype', 'Prototypes')
const constructors = itemGroup('constructor', 'Constructors')
const objects = itemGroup('object', 'Objects')
const params = itemGroup(['param', 'param?'], 'Arguments', { noSort: true })
const properties = itemGroup(['property', 'property?'], 'Properties')
const methods = itemGroup('method', 'Methods')
const events = itemGroup('event', 'Events')
const functions = itemGroup('function', 'Functions')
const returns = itemGroup('returns', 'Returns')

/* The config for building javascript api docs */
function api (typeLinks) {
  const propertyHeader = header.propertyHeader({typeLinks: typeLinks})
  const prototypeHeader = header.prototypeHeader({typeLinks: typeLinks})
  const functionHeader = header.functionHeader({typeLinks: typeLinks})
  const typeHeader = header.typeHeader({typeLinks: typeLinks})

  function typeBuilder (selection, transformer) {
    return dom.create('span')
      .class('qm-api-type-standalone qm-code-font')
      .add(type(selection.cs(), typeLinks))
  }

  const prototypeBuilder = item({
    class: 'qm-api-prototype',
    header: prototypeHeader,
    content: [ description, extras, defaultValue, constructors, groups, properties, events, methods, functions ]
  })

  const functionBuilder = item({
    class: 'qm-api-function',
    header: functionHeader,
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  const objectBuilder = item({
    class: 'qm-api-object',
    header: propertyHeader,
    content: [ description, extras, defaultValue, groups, properties, events, prototypes, functions ]
  })

  const methodBuilder = item({
    class: 'qm-api-method',
    header: functionHeader,
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  const constructorBuilder = item({
    class: 'qm-api-constructor',
    header: functionHeader,
    content: [ description, extras, params ]
  })

  const propertyBuilder = item({
    class: 'qm-api-property',
    header: propertyHeader,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const paramBuilder = item({
    class: 'qm-api-param',
    header: propertyHeader,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const eventBuilder = item({
    class: 'qm-api-event',
    header: propertyHeader,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const returnsBuilder = item({
    class: 'qm-api-returns',
    header: typeHeader,
    content: [ description, extras ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  return {
    'type': typeBuilder,
    'prototype': prototypeBuilder,
    'object': objectBuilder,
    'method': methodBuilder,
    'function': functionBuilder,
    'constructor': constructorBuilder,
    'param': paramBuilder,
    'param?': paramBuilder,
    'property': propertyBuilder,
    'property?': propertyBuilder,
    'event': eventBuilder,
    'returns': returnsBuilder
  }
}

/*
  The entity types this language handles - these entites can be represented as
  changelog entries by this language.
*/
const changelogEntityTypes = [
  'object',
  'prototype',
  'event',
  'constructor',
  'function',
  'method',
  'property',
  'property?'
]

function createChangelogHeaderDom (selection, transform) {
  if (changelogEntityTypes.some(entityType => selection.has(entityType))) {
    const header = dom.create('span')
      .class('qm-changelog-javascript-header')

    let current = selection
    while (changelogEntityTypes.some(entityType => current.has(entityType))) {
      current = current.select(changelogEntityTypes)

      const type = current.type()
      const baseType = current.type().replace('?', '')

      const section = dom.create('span')
        .class(`qm-changelog-javascript-${baseType}`)
        .add(dom.create('span').class('qm-changelog-javascript-name').text(current.param(0)))

      if (type === 'function' || type === 'method' || type === 'constructor') {
        const params = dom.create('span').class('qm-changelog-javascript-params')
          .add(current.selectAll(['param', 'param?']).map(param => {
            return dom.create('span').class('qm-changelog-javascript-param')
              .add(dom.create('span').class('qm-changelog-javascript-param-name').text(param.param(0)))
              .add(dom.create('span').class('qm-changelog-javascript-param-type').text(param.param(1)))
          }))

        section.add(params)
        if (current.has('returns')) {
          section.add(dom.create('span').class('qm-changelog-javascript-type').text(current.select('returns').ps()))
        }
      } else if (type === 'property' || type === 'property?' || type === 'event') {
        section.add(dom.create('span').class('qm-changelog-javascript-type').text(current.param(1)))
      }

      header.add(section)
    }

    return header
  }
}

module.exports = (options) => {
  const typeLinks = (options || {}).typeLinks || {}

  return {
    name: 'javascript',
    api: api(typeLinks),
    changelog: {
      entityTypes: changelogEntityTypes,
      assets: assets,
      createHeaderDom: createChangelogHeaderDom
    }
  }
}

module.exports.prototypes = prototypes
module.exports.constructors = constructors
module.exports.objects = objects
module.exports.params = params
module.exports.properties = properties
module.exports.methods = methods
module.exports.events = events
module.exports.functions = functions
module.exports.returns = returns

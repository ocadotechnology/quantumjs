'use strict'

const dom = require('quantum-dom')

const type = require('../../entity-transforms/components/type')

const header = require('../../entity-transforms/builders/header-builders')
const body = require('../../entity-transforms/builders/body-builders')
const itemBuilder = require('../../entity-transforms/builders/item-builder')


/* The config for building javascript api docs */

module.exports = (options) => {
  const typeLinks = (options || {}).typeLinks || {}

  const propertyHeader = header.propertyHeader({typeLinks: typeLinks})
  const prototypeHeader = header.prototypeHeader({typeLinks: typeLinks})
  const functionHeader = header.functionHeader({typeLinks: typeLinks})
  const typeHeader = header.typeHeader({typeLinks: typeLinks})

  const description = body.description()
  const groups = body.groups()
  const extras = body.extras()
  const defaultValue = body.defaultValue()
  const prototypes = body.prototypes()
  const constructors = body.constructors()
  const params = body.params()
  const properties = body.properties()
  const methods = body.methods()
  const events = body.events()
  const functions = body.functions()
  const returns = body.returns()

  const functionBuilder = itemBuilder({
    class: 'qm-api-function',
    header: functionHeader,
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  const objectBuilder = itemBuilder({
    class: 'qm-api-object',
    header: propertyHeader,
    content: [ description, extras, defaultValue, groups, properties, events, prototypes, functions ]
  })

  const propertyBuilder = itemBuilder({
    class: 'qm-api-property',
    header: propertyHeader,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  const paramBuilder = itemBuilder({
    class: 'qm-api-param',
    header: propertyHeader,
    content: [ description, extras, defaultValue ],
    renderAsOther: { Function: functionBuilder, Object: objectBuilder }
  })

  return {
    'type': (selection) => {
      return dom.create('span')
        .class('qm-api-type-standalone')
        .add(type(selection.cs(), typeLinks))
    },
    'prototype': itemBuilder({
      class: 'qm-api-prototype',
      header: prototypeHeader,
      content: [ description, extras, defaultValue, constructors, groups, properties, events, methods, functions ]
    }),
    'object': objectBuilder,
    'method': itemBuilder({
      class: 'qm-api-method',
      header: functionHeader,
      content: [ description, extras, defaultValue, params, groups, events, returns ]
    }),
    'function': functionBuilder,
    'constructor': itemBuilder({
      class: 'qm-api-constructor',
      header: functionHeader,
      content: [ description, extras, params ]
    }),
    'param': paramBuilder,
    'param?': paramBuilder,
    'property': propertyBuilder,
    'property?': propertyBuilder,
    'event': itemBuilder({
      class: 'qm-api-event',
      header: propertyHeader,
      content: [ description, extras, defaultValue ],
      renderAsOther: { Function: functionBuilder, Object: objectBuilder }
    }),
    'returns': itemBuilder({
      class: 'qm-api-returns',
      header: typeHeader,
      content: [ description, extras ],
      renderAsOther: { Function: functionBuilder, Object: objectBuilder }
    })
  }
}

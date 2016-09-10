'use strict'
/*

  Quantum Api
  ===========

  HTML Transforms for api docs.

*/

// builders
const bodyBuilders = require('./builders/body-builders')
const headerBuilders = require('./builders/header-builders')
const itemBuilder = require('./builders/item-builder')

// transforms
const api = require('./transforms/api')
const group = require('./transforms/group')

// languages
const javascript = require('./languages/javascript')
const css = require('./languages/css')

function defaultLanguages () {
  return [
    javascript(),
    css()
  // XXX: add rest (as in http rest, not 'the rest')
  ]
}

function defaultApiBuilders () {
  return [
    bodyBuilders.description(),
    bodyBuilders.extras(),
    bodyBuilders.groups(),
    bodyBuilders.properties(),
    bodyBuilders.prototypes(),
    bodyBuilders.objects(),
    bodyBuilders.functions(),
    bodyBuilders.classes()
  ]
}

function defaultGroupBuilders () {
  return [
    bodyBuilders.description(),
    bodyBuilders.extras(),
    bodyBuilders.groups(),
    bodyBuilders.params(),
    bodyBuilders.properties(),
    bodyBuilders.prototypes(),
    bodyBuilders.objects(),
    bodyBuilders.functions(),
    bodyBuilders.methods(),
    bodyBuilders.classes(),
    bodyBuilders.events()
  ]
}

function transforms (options) {
  const languages = (options || {}).languages || defaultLanguages()
  const apiBuilders = (options || {}).apiBuilders || defaultApiBuilders()
  const groupBuilders = (options || {}).groupBuilders || defaultGroupBuilders()

  const transformers = {
    api: api({
      builders: apiBuilders
    }),
    group: group({
      builders: groupBuilders
    })
  }

  languages.forEach((language) => {
    Object.keys(language).map((k) => {
      transformers[k] = language[k]
    })
  })

  return Object.freeze(transformers)
}

module.exports = {
  transforms: transforms,
  languages: {
    javascript: javascript,
    css: css
  },
  builders: {
    itemBuilder: itemBuilder,
    headerBuilders: headerBuilders,
    bodyBuilders: bodyBuilders
  }
}

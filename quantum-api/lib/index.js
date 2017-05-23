'use strict'
/*

  Quantum Api
  ===========

  HTML Transforms for api docs.

*/

const config = require('./config')

// builders
const header = require('./entity-transforms/builders/header')
const body = require('./entity-transforms/builders/body')
const item = require('./entity-transforms/builders/item')
const itemGroup = require('./entity-transforms/builders/item-group')

// entity entityTransforms
const api = require('./entity-transforms/api')
const changelogList = require('./entity-transforms/changelog-list')
const changelog = require('./entity-transforms/changelog')

// languages
const quantum = require('./languages/quantum')
const javascript = require('./languages/javascript')
const css = require('./languages/css')

// file entityTransforms
const changelogFileTransform = require('./file-transforms/changelog').fileTransform

function entityTransforms (options) {
  const opts = config.resolve(options)

  const entityTransforms = {
    api: api({ builders: opts.apiBuilders, languages: opts.languages }),
    changelogList: changelogList(),
    changelog: changelog(opts)
  }

  opts.languages.forEach(language => {
    entityTransforms[language.name] = language.entityTransforms
  })

  return Object.freeze(entityTransforms)
}

function fileTransform (options) {
  const opts = config.resolve(options)
  return (file) => {
    if (opts.processChangelogs) {
      return changelogFileTransform(file, opts)
    } else {
      return file
    }
  }
}

module.exports = {
  entityTransforms,
  fileTransform,
  fileTransforms: {
    changelog: changelogFileTransform
  },
  languages: {
    quantum,
    javascript,
    css
  },
  builders: {
    header,
    body,
    item,
    itemGroup
  }
}

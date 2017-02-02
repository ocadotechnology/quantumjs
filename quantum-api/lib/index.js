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

// entity transforms
const api = require('./entity-transforms/api')
const group = require('./entity-transforms/group')
const changelogList = require('./entity-transforms/changelog-list')
const changelog = require('./entity-transforms/changelog')

// languages
const quantum = require('./languages/quantum')
const javascript = require('./languages/javascript')
const css = require('./languages/css')

// file transforms
const changelogFileTransform = require('./file-transforms/changelog')

function transforms (options) {
  const opts = config.resolve(options)

  const transforms = {
    api: api({ builders: opts.apiBuilders, languages: opts.languages }),
    group: group({ builders: opts.groupBuilders }),
    changelogList: changelogList(),
    changelog: changelog(opts)
  }

  opts.languages.forEach(language => {
    transforms[language.name] = language.transforms
  })

  return Object.freeze(transforms)
}

function fileTransform (options) {
  const opts = config.resolve(options)
  return (file) => {
    if (opts.processChangelogs) {
      return changelogFileTransform.fileTransform(file, opts)
    } else {
      return file
    }
  }
}

module.exports = {
  transforms,
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
    item
  }
}

'use strict'
/*

  Quantum Api
  ===========

  HTML Transforms for api docs.

*/

const config = require('./config')

// builders
const bodyBuilders = require('./entity-transforms/builders/body-builders')
const headerBuilders = require('./entity-transforms/builders/header-builders')
const itemBuilder = require('./entity-transforms/builders/item-builder')

// entity transforms
const api = require('./entity-transforms/api')
const group = require('./entity-transforms/group')
const changelog = require('./entity-transforms/changelog')
const changelogList = require('./entity-transforms/changelog-list')

// languages
const javascript = require('./languages/javascript')
const css = require('./languages/css')

// file transforms
const changelogFileTransform = require('./file-transforms/changelog')

function transforms (options) {
  const opts = config.resolve(options)

  const transforms = {
    api: api({
      builders: opts.apiBuilders
    }),
    group: group({
      builders: opts.groupBuilders
    }),
    changelog: changelog(opts),
    changelogList: changelogList()
  }

  opts.languages.forEach(language => {
    const api = language.api
    Object.keys(api).map(k => {
      transforms[k] = api[k]
    })
  })

  return Object.freeze(transforms)
}

// The file transform
module.exports = function (options) {
  const opts = config.resolve(options)
  return (file) => {
    if(opts.processChangelogs) {
      return changelogFileTransform.fileTransform(file, opts)
    } else {
      return file
    }
  }
}

module.exports.transforms = transforms,
module.exports.languages = {
  javascript: javascript,
  css: css
}
module.exports.builders = {
  itemBuilder: itemBuilder,
  headerBuilders: headerBuilders,
  bodyBuilders: bodyBuilders
}

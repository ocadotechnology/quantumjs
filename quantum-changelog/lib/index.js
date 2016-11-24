'use strict'

const config = require('./config.js')
const pageTransform = require('./page-transform')
const entityTransforms = require('./entity-transforms')

const javascript = require('./languages/javascript')
const css = require('./languages/css')

module.exports = function (options) {
  const opts = config.resolve(options)
  return (page) => {
    return pageTransform.pageTransform(page, opts)
  }
}
module.exports.transforms = entityTransforms.transforms

// XXX: add quantum language and rest
module.exports.languages = {
  javascript: javascript,
  css: css
}

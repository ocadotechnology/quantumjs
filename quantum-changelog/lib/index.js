const merge = require('merge')

const pageTransform = require('./page-transform')
const entityTransforms = require('./entity-transforms')
const defaultConfig = require('./config.js')

const javascript = require('./languages/javascript')
const css = require('./languages/css')

module.exports = function (options) {
  const opts = merge(defaultConfig, options)
  return (page) => {
    return pageTransform.pageTransform(page, opts)
  }
}
module.exports.transforms = entityTransforms

// XXX: add quantum language
module.exports.languages = {
  javascript: javascript,
  css: css
}

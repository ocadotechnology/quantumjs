'use strict'

module.exports = function createLanguage (name, getTransforms, options, assets) {
  const { api, changelog } = getTransforms(options)
  return {
    name,
    api,
    changelog,
    assets
  }
}

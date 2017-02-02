'use strict'

module.exports = function createLanguage (name, getTransforms, options, assets) {
  const { transforms, changelogHeaderTransforms } = getTransforms(options)
  return {
    name,
    transforms,
    changelogHeaderTransforms,
    assets
  }
}

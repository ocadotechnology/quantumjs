var html = require('quantum-html')
var api = require('quantum-api')
var changelog = require('quantum-changelog')
var diagram = require('quantum-diagram')
var docs = require('quantum-docs')

module.exports = function () {
  return html.exportAssets('target/assets', [
    html.assets,
    api.assets,
    changelog.assets,
    diagram.assets,
    docs.assets
  ])
}

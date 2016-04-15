var html = require('quantum-html')
var api = require('quantum-api')
var changelog = require('quantum-changelog')
var diagram = require('quantum-diagram')
var docs = require('quantum-docs')
var codeHighlight = require('quantum-code-highlight')

html.exportAssets('target/assets', [
  html.assets,
  api.assets,
  changelog.assets,
  diagram.assets,
  docs.assets,
  codeHighlight.assets
])

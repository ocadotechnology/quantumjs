var html = require('quantum-html')
var api = require('quantum-api')
var version = require('quantum-version')
var template = require('quantum-template')
var changelog = require('quantum-changelog')
var diagram = require('quantum-diagram')
var docs = require('quantum-docs')
var hub = require('quantum-hub')
var Promise = require('bluebird')
var quantumSite = require('../transforms/transforms')

function pipeline () {
  var htmlOptions = {
    embedAssets: false,
    assetPath: '/assets'
  }

  var htmlTransforms = {
    html: html.transforms,
    api: api(),
    changelog: changelog.transforms,
    diagram: diagram(),
    docs: docs(),
    site: quantumSite
  }

  // returns a function that compiles a page out to html
  return function (obj) {
    return Promise.resolve(obj)
      .then(template())
      .then(changelog())
      .then(version())
      .map(html(htmlTransforms))
      .map(html.stringify(htmlOptions))
      .map(hub.utils.htmlRenamer)
  }
}

module.exports = {
  pipeline: pipeline,
  config: {
    pages: 'content/**/*.um',
    base: 'content'
  },
  resourceDir: 'resources'
}

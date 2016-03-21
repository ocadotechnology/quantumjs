var Promise = require('bluebird')

var html = require('quantum-html')
var api = require('quantum-api')
var version = require('quantum-version')
var template = require('quantum-template')
var changelog = require('quantum-changelog')
var diagram = require('quantum-diagram')
var docs = require('quantum-docs')
var quantumSite = require('./transforms/transforms')

function pipeline () {
  var htmlOptions = {
    embedAssets: false,
    assetPath: '/assets'
  }

  var htmlTransforms = {
    html: html.transforms,
    api: api(),
    changelog: changelog.transforms(),
    diagram: diagram(),
    docs: docs(),
    site: quantumSite
  }

  var templateVariables = {
    examples: {
      exampleList: [1, 2, 3],
      exampleObject: {
        name: 'Dave',
        age: 25
      }
    }
  }

  // returns a function that compiles a page out to html
  return function (obj) {
    return Promise.resolve(obj)
      .then(template({ variables: templateVariables }))
      .then(changelog())
      .then(version())
      .map(docs.populateTableOfContents())
      .map(html({ transforms: htmlTransforms }))
      .map(html.stringify(htmlOptions))
      .map(html.htmlRenamer())
  }
}

module.exports = {
  pipeline: pipeline,
  pages: 'content/pages/**/*.um',
  base: 'content/pages',
  resourceDir: 'content/resources'
}

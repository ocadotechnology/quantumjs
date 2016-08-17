const Promise = require('bluebird')

const html = require('quantum-html')
const api = require('quantum-api')
const version = require('quantum-version')
const template = require('quantum-template')
const changelog = require('quantum-changelog')
const diagram = require('quantum-diagram')
const codeHighlight = require('quantum-code-highlight')
const docs = require('quantum-docs')
const quantumSite = require('./transforms/transforms')

const htmlOptions = {
  embedAssets: true,
  assetPath: '/assets'
}

const htmlTransforms = {
  html: html.transforms,
  api: api(),
  changelog: changelog.transforms(),
  diagram: diagram(),
  docs: docs(),
  highlight: codeHighlight(),
  site: quantumSite
}

const templateVariables = {
  examples: {
    exampleList: [1, 2, 3],
    exampleObject: {
      name: 'Dave',
      age: 25
    }
  }
}

function pipeline (page) {
  const templateVariables = {
    examples: {
      exampleList: [1, 2, 3],
      exampleObject: {
        name: 'Dave',
        age: 25
      }
    },
    filename: page.file.src
  }

  return Promise.resolve(page)
    .then(template({ variables: templateVariables }))
    .then(changelog())
    .then(version())
    .map(docs.populateTableOfContents())
    .map(html({ transforms: htmlTransforms }))
    .map(html.stringify(htmlOptions))
    .map(html.htmlRenamer())
}

module.exports = {
  pipeline: pipeline,
  pages: 'content/pages/**/*.um',
  htmlTransforms: htmlTransforms,
  resources: [
    {
      files: [
        'node_modules/hexagon-js/dist/hexagon-light/**/*',
        '!node_modules/hexagon-js/dist/hexagon-light/favicon/*',
        '!node_modules/hexagon-js/dist/hexagon-light/hexagon.variables*',
        '!node_modules/hexagon-js/dist/hexagon-light/hexagon.print*'
      ],
      base: 'node_modules/hexagon-js/dist/hexagon-light',
      dest: 'resources/hexagon-js',
      watch: false
    },
    {
      files: 'content/resources/**/*',
      dest: 'resources',
      watch: true
    }
  ]
}

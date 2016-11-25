const Promise = require('bluebird')

const html = require('quantum-html')
const api = require('quantum-api')
const version = require('quantum-version')
const template = require('quantum-template')
const diagram = require('quantum-diagram')
const markdown = require('quantum-markdown')
const codeHighlight = require('quantum-code-highlight')
const docs = require('quantum-docs')
const quantumSite = require('./src/transforms/transforms')

const htmlOptions = {
  embedAssets: true,
  assetPath: '/resources'
}

const htmlTransforms = {
  html: html.transforms(),
  api: api.transforms(),
  diagram: diagram.transforms(),
  markdown: markdown.transforms(),
  docs: docs.transforms(),
  highlight: codeHighlight.transforms(),
  site: quantumSite
}

function customizedTemplate (page) {
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

  return template({ variables: templateVariables })(page)
}

module.exports = {
  pipeline: [
    customizedTemplate,
    api(),
    version(),
    docs(),
    html({ transforms: htmlTransforms }),
    html.build(htmlOptions),
    html.htmlRenamer()
  ],
  pages: 'src/pages/**/*.um',
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
      files: 'src/resources/**/*',
      dest: 'resources',
      watch: true
    }
  ]
}

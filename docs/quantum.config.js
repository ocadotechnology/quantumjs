global.Promise = require('bluebird')

const html = require('quantum-html')
const api = require('quantum-api')
const version = require('quantum-version')
const template = require('quantum-template')
const diagram = require('quantum-diagram')
const markdown = require('quantum-markdown')
const codeHighlight = require('quantum-code-highlight')
const docs = require('quantum-docs')
const custom = require('./src/transforms')
const customLanguage = require('./src/transforms/custom-language')

const typeLinks = {
  Array: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  Boolean: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
  Function: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
  Number: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
  Object: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  String: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
  Promise: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise',
  EventEmitter: 'https://nodejs.org/api/events.html',
  File: '/modules/quantum-js/#file',
  FileInfo: '/modules/quantum-js/#fileinfo',
  Selection: '/modules/quantum-js/#selection',
  Watcher: '/modules/quantum-js/#watcher',
  Element: '/modules/quantum-dom/#element',
  // TODO: make these links go somewhere
  Transform: '/modules/quantum-html/#transform',
  Asset: '/modules/quantum-dom/#asset'
}

const apiOptions = {
  languages: [
    customLanguage(), // For rendering example content for quantum-api
    api.languages.quantum(),
    api.languages.css(),
    api.languages.javascript({
      typeLinks: typeLinks
    })
  ]
}

const htmlOptions = {
  embedAssets: false,
  assetPath: '/resources',
  transforms: {
    html: html.transforms(),
    api: api.transforms(apiOptions),
    diagram: diagram.transforms(),
    markdown: markdown.transforms(),
    docs: docs.transforms(),
    highlight: codeHighlight.transforms(),
    custom: custom.transforms()
  }
}

function customizedTemplate (file) {
  const templateVariables = {
    examples: {
      exampleList: [1, 2, 3],
      exampleObject: {
        name: 'Dave',
        age: 25
      }
    },
    filename: file.info.src
  }

  return template.fileTransform({ variables: templateVariables })(file)
}

module.exports = {
  pipeline: [
    customizedTemplate,
    api.fileTransform(apiOptions),
    version.fileTransform(),
    docs.fileTransform(),
    html.fileTransform(htmlOptions)
  ],
  pages: {
    files: ['src/pages/**/*.um', '!**/api/**/*.um'],
    base: 'src/pages'
  },
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

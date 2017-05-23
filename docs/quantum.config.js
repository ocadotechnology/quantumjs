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

const baseUrl = process.env.GITHUB_PAGES ? '/quantumjs' : ''

const typeLinks = {
  Array: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  Boolean: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
  Function: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
  Number: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
  Object: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  String: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
  Promise: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise',
  EventEmitter: 'https://nodejs.org/api/events.html',
  File: baseUrl + '/docs/modules/quantum-js/#file',
  FileInfo: baseUrl + '/docs/modules/quantum-js/#fileinfo',
  Selection: baseUrl + '/docs/modules/quantum-js/#selection',
  Watcher: baseUrl + '/docs/modules/quantum-js/#watcher',
  Element: baseUrl + '/docs/modules/quantum-dom/#element',
  TextNode: baseUrl + '/docs/modules/quantum-dom/#textnode',
  Asset: baseUrl + '/docs/modules/quantum-dom/#asset',
  HeadWrapper: baseUrl + '/docs/modules/quantum-dom/#headwrapper',
  PageModifier: baseUrl + '/docs/modules/quantum-dom/#pagemodifier',
  FileTransform: baseUrl + '/docs/core-concepts/#file-transforms',
  EntityTransform: baseUrl + '/docs/core-concepts/#entity-transforms',
  Entity: baseUrl + '/docs/core-concepts/#entities',
  HTMLPage: baseUrl + '/docs/modules/quantum-html/#htmlpage'
}

const apiOptions = {
  languages: [
    customLanguage(), // For rendering example content for quantum-api
    api.languages.quantum(),
    api.languages.css(),
    api.languages.javascript({
      typeLinks: typeLinks
    })
  ],
  apiBuilders: [
    api.builders.body.description,
    api.builders.body.extras,
    api.builders.body.groups,
    api.languages.javascript.properties,
    api.languages.javascript.prototypes,
    api.languages.javascript.objects,
    api.languages.javascript.functions,
    api.languages.javascript.events,
    api.languages.css.classes,
    api.languages.quantum.entities
  ]
}

const htmlOptions = {
  embedAssets: false,
  assetPath: baseUrl + '/resources',
  resourcesTarget: '/resources',
  entityTransforms: {
    html: html.entityTransforms(),
    api: api.entityTransforms(apiOptions),
    diagram: diagram.entityTransforms(),
    markdown: markdown.entityTransforms(),
    docs: docs.entityTransforms(),
    highlight: codeHighlight.entityTransforms(),
    custom: custom.entityTransforms()
  }
}

function customizedTemplate (file) {
  const templateVariables = {
    examples: {
      // Used on the quantum-template example(s)
      exampleString: 'my string',
      exampleList: ['a', 'b', 'c'],
      exampleObjectList: [
        { head: 'Something', body: 'Content 1' },
        { body: 'Content 2' }
      ],
      exampleObject: {
        name: 'Dave',
        age: 25
      }
    },
    baseurl: baseUrl,
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
    files: [
      'src/pages/**/*.um',
      '!**/modules/**/api/**/*.um',
      '!**/modules/**/api.um',
      '!**/modules/**/entities.um'
    ],
    base: 'src/pages'
  },
  resolveRoot: 'src',
  resources: [
    {
      files: 'src/resources/**/*',
      dest: 'resources',
      watch: true
    }
  ]
}

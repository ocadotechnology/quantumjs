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
  File: '/docs/modules/quantum-js/#file',
  FileInfo: '/docs/modules/quantum-js/#fileinfo',
  Selection: '/docs/modules/quantum-js/#selection',
  Watcher: '/docs/modules/quantum-js/#watcher',
  Element: '/docs/modules/quantum-dom/#element',
  TextNode: '/docs/modules/quantum-dom/#textnode',
  Asset: '/docs/modules/quantum-dom/#asset',
  HeadWrapper: '/docs/modules/quantum-dom/#headwrapper',
  PageModifier: '/docs/modules/quantum-dom/#pagemodifier',
  FileTransform: '/docs/core-concepts/#file-transforms',
  EntityTransform: '/docs/core-concepts/#entity-transforms',
  Entity: '/docs/core-concepts/#the-ast-(abstract-syntax-tree)',
  HTMLPage: '/docs/modules/quantum-html/#htmlpage'
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
  assetPath: '/resources',
  resourcesTarget: '/resources',
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
    baseurl: process.env.GITHUB_PAGES ? '/quantumjs' : '',
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

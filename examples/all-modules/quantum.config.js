// Load all the quantum modules
const html = require('quantum-html')
const api = require('quantum-api')
const version = require('quantum-version')
const template = require('quantum-template')
const diagram = require('quantum-diagram')
const markdown = require('quantum-markdown')
const codeHighlight = require('quantum-code-highlight')
const docs = require('quantum-docs')

// Load the custom transforms
const customTransforms = require('./src/transforms/custom-transforms')

// Define the options for the template module
const templateOptions = {
  // Define the variables to use:
  variables: {
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
  }
}

// Provide type links for quantum-api
const typeLinks = {
  Array: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  Boolean: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
  Function: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
  Number: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number',
  Object: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  String: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String',
  Promise: 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise'
}

// Provide the languages to use when creating apis with quantum-api
const apiOptions = {
  languages: [
    api.languages.quantum(),
    api.languages.css(),
    api.languages.javascript({
      typeLinks: typeLinks
    })
  ]
}

const htmlOptions = {
  embedAssets: false,
  // Output assets to `/resources`
  assetPath: '/resources',
  resourcesTarget: '/resources',
  entityTransforms: {
    // Add the entity transforms from all the quantum modules
    html: html.entityTransforms(),
    api: api.entityTransforms(apiOptions),
    diagram: diagram.entityTransforms(),
    markdown: markdown.entityTransforms(),
    docs: docs.entityTransforms(),
    highlight: codeHighlight.entityTransforms(),
    customTransforms: customTransforms.entityTransforms()
  }
}


// Export the options for quantum to use
module.exports = {
  // The port to run quantum on when watching
  port: 9000,
  // The quantum pipeline to use when transforming files
  pipeline: [
    // Parse all the template content
    template.fileTransform(templateOptions),
    // Generate changelogs from the api content
    api.fileTransform(apiOptions),
    // Generate the versioned api content
    version.fileTransform(),
    // Generate the table of contents for the pages
    docs.fileTransform(),
    // Convert the transformed files to HTML using the entity transforms
    html.fileTransform(htmlOptions)
  ],
  // The pages to include in the site
  pages: {
    files: [
      'src/content/**/*.um'
    ],
    base: 'src/content'
  },
  // The path to resolve absolute paths from
  resolveRoot: 'src',
  // Additional files to include on the site (e.g. custom CSS, SVG etc.)
  resources: [
    {
      files: 'src/resources/**/*',
      dest: 'resources',
      watch: true
    }
  ],
  // Output to the 'public' directory
  dest: 'public'
}

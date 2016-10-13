'use strict'
const dom = require('quantum-dom')
const highlightCode = require('quantum-code-highlight').highlightCode
const marked = require('marked')
const path = require('path')
/*

  Quantum Markdown
  ===========

  HTML Transform for using markdown with quantum.
*/

// Behave more like markdown (don't fix any bugs in markdown)
marked.setOptions({
  pedantic: true,
  highlight: highlightCode
})

function markdown (selection, transform) {
  return dom.create('div').class('qm-markdown')
    .add(marked(selection.cs()))
    .add(dom.asset({
      url: '/assets/quantum-markdown.css',
      file: path.join(__dirname, '../assets/quantum-markdown.css'),
      shared: true
    }))
    .add(require('quantum-code-highlight').stylesheetAsset)
}

function transforms (options) {
  return Object.freeze({
    markdown: markdown
  })
}

module.exports.transforms = transforms

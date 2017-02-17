'use strict'

/*

  Quantum Markdown
  ================

  HTML Transform for using markdown with quantum.
*/

const dom = require('quantum-dom')
const marked = require('marked')
const path = require('path')
const codeHighlight = require('quantum-code-highlight')

const stylesheetAsset = dom.asset({
  url: '/quantum-markdown.css',
  filename: path.join(__dirname, '../assets/quantum-markdown.css'),
  shared: true
})

marked.setOptions({
  highlight: codeHighlight.highlightCode
})

function markdown (selection, transform) {
  const parsedMarkdown = marked(selection.cs())
    .split('<code>')
    .join('<code class="qm-code-font">')
  return dom.create('div').class('qm-markdown')
    .add(parsedMarkdown)
    .add(stylesheetAsset)
    .add(codeHighlight.stylesheetAsset)
}

function transforms (options) {
  return Object.freeze({
    markdown: markdown
  })
}

module.exports = {
  transforms
}

'use strict'

const hljs = require('highlight.js')
const dom = require('quantum-dom')
const quantumSyntax = require('./quantum-syntax.js')
const path = require('path')

const stylesheetAsset = dom.asset({
  url: '/assets/quantum-code-highlight.css',
  file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
  shared: true
})

// TODO: try and get quantum registered in hljs
hljs.registerLanguage('um', quantumSyntax)

function highlightCode (code, language) {
  if (language === 'nohighlight') {
    return code
  } else if (language) {
    return hljs.highlight(language, code, true).value
  } else {
    return hljs.highlightAuto(code).value
  }
}

function createHighlightedDom (code, language) {
  return dom.create('code')
    .text(highlightCode(code, language), {escape: false})
    .add(stylesheetAsset)
}

function codeblock (selection, transform) {
  const language = selection.ps()
  return dom.create('div')
    .class('quantum-code-highlight-codeblock' + (language && language !== 'nohighlight' ? ' language-' + language : ''))
    .add(dom.create('pre').add(createHighlightedDom(selection.cs(), language)))
}

function code (selection, transform) {
  const language = selection.ps()
  return createHighlightedDom(selection.cs(), language)
    .class('quantum-code-highlight-code' + (language && language !== 'nohighlight' ? ' language-' + language : ''))
}

function transforms (opts) {
  return Object.freeze({
    codeblock: codeblock,
    code: code
  })
}

module.exports.highlightCode = highlightCode
module.exports.stylesheetAsset = stylesheetAsset
module.exports.transforms = transforms

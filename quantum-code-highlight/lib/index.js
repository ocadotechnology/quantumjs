'use strict'

const hljs = require('highlight.js')
const dom = require('quantum-dom')
const quantumSyntax = require('./quantum-syntax.js')
const path = require('path')

const stylesheetAsset = dom.asset({
  url: '/quantum-code-highlight.css',
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

function code (selection, transform) {
  const language = selection.ps()
  return dom.create('code')
    .class('quantum-code-highlight-code' + (language ? ' language-' + language : ''))
    .text(selection.cs(), {escape: true})
    .add(stylesheetAsset)
}

function codeblock (selection, transform) {
  const language = selection.ps()
  return dom.create('div')
    .class('quantum-code-highlight-codeblock' + (language && language !== 'nohighlight' ? ' language-' + language : ''))
    .add(dom.create('pre')
      .add(dom.create('code')
        .text(highlightCode(selection.cs(), language), {escape: false})))
    .add(stylesheetAsset)
}

function transforms (opts) {
  return Object.freeze({
    code: code,
    codeblock: codeblock
  })
}

module.exports.highlightCode = highlightCode
module.exports.stylesheetAsset = stylesheetAsset
module.exports.transforms = transforms

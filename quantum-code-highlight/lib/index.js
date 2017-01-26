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
  if (language) {
    const validLanguage = hljs.getLanguage(language) !== undefined
    return validLanguage ? hljs.highlight(language, code, true).value : code
  } else {
    return hljs.highlightAuto(code).value
  }
}

function code (selection, transform) {
  return dom.create('code')
    .class('qm-code-highlight-code qm-code-font')
    .text(selection.cs(), {escape: true})
    .add(stylesheetAsset)
}

function codeblock (selection, transform) {
  const language = selection.ps()
  return dom.create('div')
    .class(`qm-code-highlight-codeblock qm-code-font${language && language !== 'nohighlight' ? ` language-${language}` : ''}`)
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

module.exports = {
  highlightCode,
  stylesheetAsset,
  transforms
}

var quantum = require('quantum-js')
var hljs = require('highlight.js')
var quantumSyntax = require('./quantum-syntax.js')

// TODO: try and get quantum registered in hljs
hljs.registerLanguage('um', quantumSyntax)

function highlightCode (language, code) {
  if (language) {
    return hljs.highlight(language, code, true).value
  } else {
    return hljs.highlightAuto(code).value
  }
}

function codeblock (entity, page, transform) {
  page.asset('quantum-code-highlight.css', __dirname + '/client/quantum-code-highlight.css')
  return page.create('div').class('quantum-code-highlight-codeblock language-' + entity.ps())
    .add(page.create('pre').text(highlightCode(entity.ps(), entity.cs()), true))
}

function code (entity, page, transform) {
  page.asset('quantum-code-highlight.css', __dirname + '/client/quantum-code-highlight.css')
  return page.create('code')
    .class('quantum-code-highlight-code language-' + entity.ps())
    .text(highlightCode(entity.ps(), entity.cs()), true)
}

module.exports = function (options) {
  return {
    codeblock: codeblock,
    code: code
  }
}

module.exports.assets = {
  'quantum-code-highlight.css': __dirname + '/client/quantum-code-highlight.css'
}

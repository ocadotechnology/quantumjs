'use strict'

/*

  Quantum Markdown
  ================

  HTML Transform for using markdown with quantum.
*/

const dom = require('quantum-dom')
const path = require('path')
const codeHighlight = require('quantum-code-highlight')
const toc = require('markdown-toc')
const marked = require('marked')

const stylesheetAsset = dom.asset({
  url: '/quantum-markdown.css',
  filename: path.join(__dirname, '../assets/quantum-markdown.css'),
  shared: true
})

const whitespaceRegEx = /[^\w]+/g
const codeHTMLTagRegEx = /<code( class="(.*)")?>/gi

function headingRenderer (headings) {
  return (text, level) => {
    // Convert `Heading Text` to `heading-text`
    const escapedText = text.toLowerCase().replace(whitespaceRegEx, '-')
    const duplicateIndex = headings.map(({ text }) => text).indexOf(escapedText)
    let duplicateText = undefined
    if (duplicateIndex === -1) {
      headings.push({
        text: escapedText,
        count: 0
      })
    } else {
      headings[duplicateIndex].count++
      duplicateText = `${escapedText}-${headings[duplicateIndex].count}`
    }
    return `<h${level} class="qm-header-font">${text}<a class="qm-docs-anchor-icon" id="${duplicateText || escapedText}" href="#${duplicateText || escapedText}"></a></h${level}>\n`
  }
}

function parseMarkdown (content) {
  const renderer = new marked.Renderer()
  renderer.heading = headingRenderer([])
  const markdownOpts = {
    renderer,
    highlight: (code, language) => {
      if (language) {
        return codeHighlight.highlightCode(code, language)
      } else {
        return code
      }
    }
  }
  return marked(toc.insert(content), markdownOpts)
    // Replace `<code>` and `<code class="xxx">` with `<code class="qm-code-font xxx">`
    // For `<code>` it ends up being `<code class="qm-code-font ">` (as $2 is unmatched in the RegEx)
    .replace(codeHTMLTagRegEx, '<code class="qm-code-font $2">')
    // Replace the TOC `<ul>` with one that has a class so we can style it easily
    .replace('<!-- toc -->\n<ul>', '<div class="qm-markdown-toc-header qm-header-font">Contents</div>\n<ul class="qm-markdown-toc">')
    .replace('<!-- tocstop -->\n', '')
}

function markdown (selection, transform) {
  return dom.create('div').class('qm-markdown')
    .add(parseMarkdown(selection.cs()))
    .add(stylesheetAsset)
    .add(codeHighlight.stylesheetAsset)
}

function transforms (options) {
  return Object.freeze({
    markdown: markdown
  })
}

module.exports = {
  transforms,
  parseMarkdown
}

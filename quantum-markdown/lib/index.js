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

function headingRenderer (headings) {
  return (text, level) => {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')
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
    return `<h${level}>${text}<a class="qm-docs-anchor-icon" id="${duplicateText || escapedText}" href="#${duplicateText || escapedText}"></a></h${level}>\n`
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
  return marked(content, markdownOpts)
    .replace(/<code( class="(.*)")?>/gi, '<code class="qm-code-font $2">')
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
  transforms
}

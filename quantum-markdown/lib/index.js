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

// Define all regex outside functions so they are only created once
const codeHTMLTagRegEx = /<code( class="(.*)")?>/gi

const lastCharDashRegex = /-$/
const multiDashRegex = /--+/g

/*
  This essentially finds any of the following characters: ~!@#$%^&*(){}[]=:/\,;?+\'"
  (e.g. the characters wrapped by [...])

  The + outside the [...] indicates a 'one or more' check so ! would be matched once, as would !!!!!
*/
const unsafeCharsRegex = /[\s~!@#$%^&*(){}[\]=:/\\,;?+'"]+/g

const ampRegex = /&amp;/g
const ltRegex = /&lt;/g
const gtRegex = /&gt;/g
const quotRegex = /&quot;/g
const singleQuotRegex = /&#039;/g
const singleQuotRegexAlt = /&#39;/g

// Marked converts & -> &amp; (etc) so we have to convert back for the sluggify to work
function unEscapeHtmlTags (text) {
  return text
    .replace(ampRegex, '&')
    .replace(ltRegex, '<')
    .replace(gtRegex, '>')
    .replace(quotRegex, '"')
    .replace(singleQuotRegex, '\'')
    .replace(singleQuotRegexAlt, '\'')
}

// Takes a text string and returns a url-safe string for use when de-duplicating
function sluggifyText (text) {
  const slug = unEscapeHtmlTags(text).toLowerCase()
    // Replace 'unsafe' chars with dashes (!!!! is changed to -)
    .replace(unsafeCharsRegex, '-')
    // Replace multiple concurrent dashes with a single dash
    .replace(multiDashRegex, '-')
    // Remove trailing -
    .replace(lastCharDashRegex, '')
  // Encode the resulting string to make it url-safe
  return encodeURIComponent(slug)
}

// Takes an array and an sluggify function and returns a function that de-duplicates headings
function dedupeAndSluggify (sluggify) {
  const existingHeadings = {}
  return (heading) => {
    const sluggifiedText = sluggify(heading)
    const existingCount = existingHeadings[sluggifiedText] || 0
    existingHeadings[sluggifiedText] = existingCount + 1
    return existingCount > 0 ? `${sluggifiedText}-${existingCount}` : sluggifiedText
  }
}

function headingRenderer () {
  const dedupeChecker = dedupeAndSluggify(sluggifyText)
  return (text, level) => {
    // Convert `Heading Text` to `heading-text`
    const dedupedSlug = dedupeChecker(text)
    return `<h${level} class="qm-header-font">${text}<a class="qm-docs-anchor-icon" id="${dedupedSlug}" href="#${dedupedSlug}"></a></h${level}>\n`
  }
}

function parseMarkdown (content) {
  const renderer = new marked.Renderer()
  renderer.heading = headingRenderer()
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

  if (content.indexOf('<!-- toc -->') > -1) {
    const tocDeDuplicator = dedupeAndSluggify(sluggifyText)
    const pageToc = toc(content.replace('<!-- toc -->', '<!-- toc -->\n'), {
      firsth1: false
    })
    const pageTocString = pageToc.json.map(token => {
      return toc.linkify(token, {
        slugify: tocDeDuplicator,
        fisth1: false
      })
    }).reduce(({ indent, res }, { lvl, content }, index) => {
      let innerIndent = indent
      if (index === 0) {
        innerIndent = lvl
      }
      if (lvl < innerIndent) {
        innerIndent = lvl
      }
      const level = lvl - innerIndent
      return {
        indent: innerIndent,
        res: res.concat(['  '.repeat(level) + '- ' + content])
      }
    }, { indent: 0, res: [] }).res.join('\n')

    return marked(content.replace('<!-- toc -->', `\n<!-- TOC-REPLACE -->\n${pageTocString}\n`), markdownOpts)
      // Replace the TOC `<ul>` with one that has a class so we can style it easily
      .replace('<!-- TOC-REPLACE -->\n<ul>', '<div class="qm-markdown-toc-header qm-header-font">Contents</div>\n<ul class="qm-markdown-toc">')
      // Replace `<code>` and `<code class="xxx">` with `<code class="qm-code-font xxx">`
      // For `<code>` it ends up being `<code class="qm-code-font ">` (as $2 is unmatched in the RegEx)
      .replace(codeHTMLTagRegEx, '<code class="qm-code-font $2">')
  } else {
    return marked(content, markdownOpts)
      // Replace `<code>` and `<code class="xxx">` with `<code class="qm-code-font xxx">`
      // For `<code>` it ends up being `<code class="qm-code-font ">` (as $2 is unmatched in the RegEx)
      .replace(codeHTMLTagRegEx, '<code class="qm-code-font $2">')
  }
}

function markdown (selection, transform) {
  return dom.create('div').class('qm-markdown')
    .add(parseMarkdown(selection.cs()))
    .add(stylesheetAsset)
    .add(codeHighlight.stylesheetAsset)
}

function entityTransforms (options) {
  return Object.freeze({
    markdown: markdown
  })
}

module.exports = {
  entityTransforms,
  parseMarkdown
}

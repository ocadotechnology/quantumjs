'use strict'
/*

  Dom
  ====

  This module provides an api for building up a virtual representation
  of the dom, which can then be stringifyed out to a html string.

*/

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

// -------- Utils --------

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
}

// html entity encoding
function escapeHTML (text) {
  return String(text).replace(/[&<>"'/]/g, (s) => entityMap[s])
}

// creates a random id
function randomId () {
  const res = new Array(32)
  const alphabet = 'ABCDEF0123456789'
  for (let i = 0; i < 32; i++) {
    res[i] = alphabet[Math.floor(Math.random() * 16)]
  }
  return res.join('')
}

function isString (x) {
  return typeof (x) === 'string' || x instanceof String
}

// -------- Prototypes --------

// an abstract representation of a dom node
function Element (type) {
  this.type = type
  this.attrs = {}
  this.content = []
  this.endContent = []
}

function elementyPromise (promise) {
  promise.add = (el, options) => elementyPromise(promise.then(p => p.add(el, options)))
  return promise
}

// sets an attribute for the element
Element.prototype.attr = function (name, value) {
  if (arguments.length === 1) {
    return this.attrs[name]
  } else {
    if (value === undefined) {
      delete this.attrs[name]
    } else {
      this.attrs[name] = value
    }
    return this
  }
}

// sets the id for this element
Element.prototype.id = function (id) {
  if (arguments.length === 0) {
    return this.attr('id')
  } else {
    return this.attr('id', id)
  }
}

// sets the class attribute for this element
Element.prototype['class'] = function (cls) {
  if (arguments.length === 0) {
    return this.attr('class') || ''
  } else {
    return this.attr('class', cls)
  }
}

// adds / removes a class for this element
Element.prototype.classed = function (cls, add) {
  const parts = cls.split(' ')

  if (parts.length > 1) {
    if (arguments.length > 1) {
      parts.forEach(c => this.classed(c, add))
      return this
    } else {
      return parts.every(c => this.classed(c))
    }
  }

  const hasClass = this.class().split(' ').indexOf(cls) !== -1
  if (arguments.length > 1) {
    if (add) {
      if (!hasClass) {
        const hasNoClasses = this.class() === ''
        this.class(hasNoClasses ? cls : this.class() + ' ' + cls)
      }
    } else {
      if (hasClass) {
        const newClass = this.class().split(' ').filter(c => c !== cls).join(' ')
        this.class(newClass)
      }
    }
    return this
  } else {
    return hasClass
  }
}

// adds an element to this element, and returns this element
Element.prototype.add = function (element, options) {
  if (element === undefined) {
    return this
  }

  if (element.then) {
    return elementyPromise(element.then(el => this.add(el, options)))
  }

  if (Array.isArray(element)) {
    if (element.some(x => x && x.then)) {
      return this.add(Promise.all(element), options)
    } else {
      element.forEach(el => this.add(el, options))
    }
  } else {
    if (element instanceof Element) {
      element.parent = this
    }
    if (options && options.addToEnd) {
      this.endContent.push(element)
    } else {
      this.content.push(element)
    }
  }

  return this
}

// adds text to the content of the element
Element.prototype.text = function (text, options) {
  if (text !== undefined) {
    const escape = (options && options.escape !== false) || options === undefined
    this.content.push(escape ? escapeHTML(text) : text)
  }
  return this
}

// removes a child from this element
Element.prototype.removeChild = function (element) {
  const index = this.content.indexOf(element)
  if (index > -1) {
    this.content.splice(index, 1)
  }
  return index > -1
}

// removes this element from its parent
Element.prototype.remove = function () {
  if (this.parent) {
    this.parent.removeChild(this)
  }
}

// turns the element into an html string
Element.prototype.stringify = function () {
  let res = '<' + this.type
  const attrs = this.attrs
  const attrKeys = Object.keys(attrs)
  const attrKeysL = attrKeys.length
  for (let i = 0; i < attrKeysL; i++) {
    const k = attrKeys[i]
    res += ' ' + k + '="' + attrs[k] + '"'
  }

  res += '>'

  const content = this.content
  const contentL = content.length
  for (let i = 0; i < contentL; i++) {
    const d = content[i]
    res += d.stringify ? d.stringify() : (isString(d) ? d : '')
  }

  const endContent = this.endContent
  const endContentL = endContent.length
  for (let i = 0; i < endContentL; i++) {
    const d = endContent[i]
    res += d.stringify ? d.stringify() : (isString(d) ? d : '')
  }

  res += `</${this.type}>`

  return res
}

function TextNode (text, options) {
  this.text = text
  this.options = options
}

TextNode.prototype.stringify = function () {
  return this.options && this.options.escape === false ? this.text : escapeHTML(this.text)
}

function Asset (options) {
  this.url = options.url
  this.filename = options.filename
  this.type = options.type
  this.content = options.content
}

function HeadWrapper (element, options) {
  this.element = element
  this.options = options
}

function PageModifier (options) {
  this.options = options
}

// extracts 'elements' of particular types from the tree of elements (for
// extracting HeadWrapper and Asset 'elements')
function extractTypes (elements, Types) {
  function inner (elements, res) {
    const l = elements.length
    for (let i = 0; i < l; i++) {
      const e = elements[i]
      const index = Types.indexOf(e.constructor)
      if (index > -1) {
        res[index].push(e)
      } else if (e instanceof Element) {
        inner(e.content, res)
        inner(e.endContent, res)
      }
    }
  }

  const res = Types.map(() => [])
  inner(elements, res)
  return res
}

// -------- Factories --------

// creates an element of the type given
function create (type) {
  return new Element(type)
}

// creates an element of the type given
function textNode (text, options) {
  return new TextNode(text, options)
}

// creates an element of the type given
function bodyClassed (cls, classed) {
  return new PageModifier({
    type: 'body-classed',
    class: cls,
    classed: classed
  })
}

// injects an element into the head element when the page is created
function head (element, options) {
  return new HeadWrapper(element, options || {})
}

// adds an asset to the page - the user can choose to embed or not when stringifying
function asset (options) {
  return new Asset(options || {})
}

// renders the elements given to html
function stringify (elements, options = {}) {
  const {
    embedAssets = true,
    assetPath = '',
    baseUrl = '',
    assetLoader = (filename) => fs.readFileAsync(filename, 'utf-8')
  } = options

  const [headWrappers, modifiers, assets] = extractTypes(elements, [HeadWrapper, PageModifier, Asset])

  const latestById = {}
  headWrappers.forEach(w => {
    if (w.options.id) {
      latestById[w.options.id] = w
    }
  })

  const bodyClassesMap = {}
  modifiers
    .filter(m => m.options.type === 'body-classed')
    .forEach(m => {
      bodyClassesMap[m.options.class] = m.options.classed
    })

  const bodyClass = Object.keys(bodyClassesMap)
    .filter(c => bodyClassesMap[c])
    .join(' ')

  const headElements = headWrappers
    .filter(w => w.options.id ? w === latestById[w.options.id] : true)
    .map(w => w.element)
    .map(e => e.stringify ? e.stringify() : (isString(e) ? e : ''))
    .join('')

  const bodyElements = elements
    .map(e => e !== undefined && e.stringify ? e.stringify() : (isString(e) ? e : ''))
    .join('')

  // only keep unique assets
  const uniqueAssetsMap = {}
  const anonymousAssets = []
  assets.forEach(asset => {
    if (asset.url) {
      uniqueAssetsMap[asset.url] = asset
    } else {
      anonymousAssets.push(asset)
    }
  })
  const uniqueAssets = Object.keys(uniqueAssetsMap).map(k => uniqueAssetsMap[k])

  const exportAssets = []

  const stylesheets = Promise.all(uniqueAssets.filter(a => a.url.endsWith('.css')).map(s => {
    if (embedAssets) {
      if (s.content) {
        return `<style>${s.content}</style>`
      } else {
        return assetLoader(s.filename)
          .then(content => `<style>${content}</style>`)
      }
    } else {
      exportAssets.push(s)
      return `<link rel="stylesheet" href="${path.join(baseUrl, assetPath, s.url)}"></link>`
    }
  }))

  const anonymousStylesheets = anonymousAssets.filter(a => a.type === 'css').map(s => {
    if (s.content) {
      return `<style>${s.content}</style>`
    } else {
      return assetLoader(s.filename)
        .then(content => `<style>${content}</style>`)
    }
  })

  const scripts = Promise.all(uniqueAssets.filter(a => a.url.endsWith('.js')).map(s => {
    if (embedAssets) {
      if (s.content) {
        return `<script>${s.content}</script>`
      } else {
        return assetLoader(s.filename)
          .then(content => `<script>${content}</script>`)
      }
    } else {
      exportAssets.push(s)
      return `<script src="${path.join(baseUrl, assetPath, s.url)}"></script>`
    }
  }))

  const anonymousScripts = anonymousAssets.filter(a => a.type === 'js').map(s => {
    if (s.content) {
      return `<script>${s.content}</script>`
    } else {
      return assetLoader(s.filename)
        .then(content => `<script>${content}</script>`)
    }
  })

  // Also export any un-embeddable assets
  uniqueAssets.forEach(asset => {
    if (!asset.url.endsWith('.js') && !asset.url.endsWith('.css')) {
      exportAssets.push(asset)
    }
  })

  return Promise.all([stylesheets, scripts])
    .spread((stylesheets, scripts) => {
      const bodyClasses = 'qm-body-font' + (bodyClass ? ' ' + bodyClass : '')
      const head = `<head>${stylesheets.join('')}${anonymousStylesheets.join('')}${headElements}</head>`
      const body = `<body class="${bodyClasses}">${bodyElements}${scripts.join('')}${anonymousScripts.join('')}</body>`
      const html = `<!DOCTYPE html>\n<html>\n${head}\n${body}</html>`
      return {
        html: html,
        assets: exportAssets
      }
    })
}

module.exports = {
  Element,
  TextNode,
  HeadWrapper,
  Asset,
  PageModifier,
  asset,
  bodyClassed,
  create,
  escapeHTML,
  head,
  randomId,
  stringify,
  textNode
}

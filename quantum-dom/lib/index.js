'use strict'
/*

  Dom
  ====

  This module provides an api for building up a virtual representation
  of the dom, which can then be stringifyed out to a html string.

*/

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

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
  return String(text).replace(/[&<>"'\/]/g, (s) => entityMap[s])
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
    this.attrs[name] = value
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
  const attributes = Object.keys(this.attrs).map(k => k + '="' + this.attrs[k] + '"').join(' ')
  const content = this.content.map(d => d.stringify ? d.stringify() : (isString(d) ? d : '')).join('')
  const endContent = this.endContent.map(d => d.stringify ? d.stringify() : (isString(d) ? d : '')).join('')
  return '<' + this.type + (attributes.length > 0 ? ' ' + attributes : '') + '>' + content + endContent + '</' + this.type + '>'
}

function TextNode (text) {
  this.text = text
}

TextNode.prototype.stringify = function () {
  return this.text
}

function Asset (url, filename, shared) {
  this.url = url
  this.filename = filename
  this.shared = shared
}

function HeadInjectWrapper (element, options) {
  this.element = element
  this.options = options
}

function PageModifier (options) {
  this.options = options
}

// extracts 'elements' of a particular type from the tree of elements (for
// extracting HeadInjectWrapper and Asset 'elements')
function extractByType (elements, Type) {
  function inner (elements, res) {
    elements.forEach((e) => {
      if (e instanceof Type) {
        res.push(e)
      } else if (e instanceof Element) {
        inner(e.content, res)
        inner(e.endContent, res)
      }
    })
  }

  const res = []
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
  return new TextNode(options && options.escape === false ? text : escapeHTML(text))
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
  return new HeadInjectWrapper(element, options || {})
}

// adds an asset to the page - the user can choose to embed or not when stringifying
function asset (options) {
  const opts = options || {}
  return new Asset(opts.url || '', opts.file || '', opts.shared === true)
}

// renders the element given to html
function stringify (elements, options) {
  const embedAssets = options ? options.embedAssets !== false : true
  const assetPath = options ? options.assetPath || '' : ''

  const headElementWrappers = extractByType(elements, HeadInjectWrapper)
  const modifiers = extractByType(elements, PageModifier)

  const latestById = {}
  headElementWrappers.forEach(w => {
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

  const headElements = headElementWrappers
    .filter(w => w.options.id ? w === latestById[w.options.id] : true)
    .map(w => w.element)
    .map(e => e.stringify ? e.stringify() : (isString(e) ? e : ''))
    .join('')

  const bodyElements = elements
    .map(e => e !== undefined && e.stringify ? e.stringify() : (isString(e) ? e : ''))
    .join('')

  const assets = extractByType(elements, Asset)

  // XXX: add an option for choosing where the assets live

  // only keep unique assets
  const uniqueAssetsMap = {}
  assets.forEach(asset => {
    uniqueAssetsMap[asset.url] = asset
  })
  const uniqueAssets = Object.keys(uniqueAssetsMap).map(k => uniqueAssetsMap[k])

  const stylesheets = Promise.all(uniqueAssets.filter(a => a.url.endsWith('.css')).map(s => {
    if (embedAssets) {
      // XXX: make this loader configurable so that assets can be cached
      return fs.readFileAsync(s.filename, 'utf-8').then(content => '<style>' + content + '</style>')
    } else {
      return '<link rel="stylesheet" href="' + assetPath + s.url + '"></link>'
    }
  }))

  const scripts = Promise.all(uniqueAssets.filter(a => a.url.endsWith('.js')).map(s => {
    if (embedAssets) {
      // XXX: make this loader configurable so that assets can be cached
      return fs.readFileAsync(s.filename, 'utf-8').then(content => '<script>' + content + '</script>')
    } else {
      return '<script src="' + assetPath + s.url + '"></script>'
    }
  }))

  return Promise.all([stylesheets, scripts])
    .spread((stylesheets, scripts) => {
      const head = '<head>' + headElements + stylesheets.join('') + '</head>'
      const openBodyTag = bodyClass ? '<body class="' + bodyClass + '">' : '<body>'
      const body = openBodyTag + bodyElements + scripts.join('') + '</body>'
      const html = '<!DOCTYPE html>\n' + '<html>' + head + body + '</html>'
      return {
        // XXX: add the list of assets for copying reources
        html: html
      }
    })
}

module.exports = {
  create: create,
  textNode: textNode,
  bodyClassed: bodyClassed,
  asset: asset,
  head: head,
  stringify: stringify,
  randomId: randomId,
  escapeHTML: escapeHTML
}

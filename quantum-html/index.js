'use strict'

const path = require('path')

const unique = require('array-unique')
const Promise = require('bluebird')
const merge = require('merge')

const quantum = require('quantum-js')
const dom = require('quantum-dom')

const types = [
  'a',
  'b',
  'br',
  'button',
  'div',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'input',
  'label',
  'li',
  'link',
  'meta',
  'ol',
  'option',
  'p',
  'pre',
  'select',
  'span',
  'style',
  'table',
  'tbody',
  'td',
  'textarea',
  'th',
  'thead',
  'tr',
  'ul',
  'vr'
]

const transforms = {}

function entityToElement (type, selection, parsePs) {
  const element = dom.create(type)
  const classId = selection.ps()

  if (selection.has('id')) {
    element.id(selection.select('id').ps())
  } else if (parsePs) {
    const match = classId.match(/#[^\.#]+/)
    if (match) {
      const id = match.map(d => d.substring(1))[0]
      element.id(id)
    }
  }

  if (selection.has('class')) {
    element.class(selection.select('class').ps())
  } else if (parsePs) {
    const match = classId.match(/(\.[^\.#]+)/g)
    if (match) {
      const cls = unique(match.map(d => d.substring(1))).join(' ')
      element.class(cls)
    }
  }

  selection.selectAll('attr').forEach(function (attr) {
    element.attr(attr.ps(), attr.cs())
  })
  return element
}

const attributeEntities = [
  'attr',
  'class',
  'id'
]

function setupElement (type, selection, transform, parsePs) {
  var element = entityToElement(type, selection, parsePs)
  return selection
    .filter((selection) => attributeEntities.indexOf(selection.type) === -1)
    .transform(transform)
    .then(elements => element.add(elements.filter(d => d)))
    .then(() => element)
}

// define the common element types as entity transforms
types.forEach((type) => {
  transforms[type] = function (selection, transform) {
    return setupElement(type, selection, transform, true)
  }
})

transforms.bodyClassed = function (selection, transform) {
  return dom.bodyClassed(selection.ps(), selection.cs() !== 'false')
}

transforms.title = function (selection, transform) {
  return dom.head(dom.create('title').attr('name', selection.ps()), {id: 'title'})
}

transforms.head = function (selection, transform) {
  return selection.transform(transform)
    .then(elements => dom.arrayNode(elements.filter(d => d).map(e => dom.head(e))))
}

transforms.html = function (selection, transform) {
  return dom.textNode(selection.cs(), {escape: false})
}

transforms.script = function (selection, transform) {
  return dom.create('script').attr('src', selection.ps())
}

transforms.stylesheet = function (selection, transform) {
  return dom.head(dom.create('link')
    .attr('href', selection.ps())
    .attr('rel', 'stylesheet'))
}

transforms.hyperlink = function (selection, transform) {
  return setupElement('a', selection, transform, false)
    .then((element) => element.attr('href', selection.ps()))
}

transforms.js = function (selection, transforms) {
  return dom.create('script').text(selection.cs(), {escape: false})
}

transforms.css = function (selection, transforms) {
  return dom.head(dom.create('style').text(selection.cs(), {escape: false}))
}

// flattens out namespaced renderers into a single object
function prepareTransforms (transforms, namespace, target) {
  namespace = namespace || ''
  target = target || {}
  for (var d in transforms) {
    if (typeof (transforms[d]) === 'function') {
      target[namespace + d] = transforms[d]
      target[d] = transforms[d]
    } else {
      prepareTransforms(transforms[d], namespace + d + '.', target)
    }
  }

  return target
}

function paragraphTransform (selection, transform) {
  const paragraphs = [
    dom.asset({
      url: '/assets/quantum-html.css',
      file: path.join(__dirname, 'assets/quantum-html.css'),
      shared: true
    })
  ]

  let currentParagraph

  selection.content().forEach((e) => {
    if (e === '') {
      if (currentParagraph) {
        paragraphs.push(currentParagraph)
        currentParagraph = undefined
      }
    } else {
      if (!currentParagraph) {
        currentParagraph = dom.create('div').class('qm-html-paragraph')
      }

      if (quantum.select.isEntity(e)) {
        currentParagraph = currentParagraph
          .add(transform(quantum.select(e)))
          .add(dom.textNode(' '))
      } else {
        currentParagraph = currentParagraph
          .add(dom.textNode(e + ' '))
      }
    }
  })

  if (currentParagraph) {
    paragraphs.push(currentParagraph)
    currentParagraph = undefined
  }

  const result = dom.all(paragraphs)

  return result.then ? result.then(dom.arrayNode) : dom.arrayNode(result)
}

// returns the transform function that converts parsed um source to virtual dom.
// returns a new transform function for the transforms object supplied. this curried
// function makes that api a bit more fluid.
module.exports = function (opts) {
  var options = merge({
    transforms: transforms,
    transformer: function (selection, defaultTransformer) {
      return defaultTransformer(selection)
    }
  }, opts)

  // holds all transforms with namespace variants and non namespace variants
  var transformMap = prepareTransforms(options.transforms)

  // the actual transform function that turns parsed content into html content
  return function (page) {
    // the default transform just makes a text node
    function defaultTransform (selection) {
      return quantum.select.isSelection(selection) ? selection.cs() : selection
    }

    // renders an selection by looking at its type and selecting the transform from the list
    function transformEntity (selection) {
      var type = quantum.select.isSelection(selection) ? selection.type() : undefined
      if (type in transformMap) {
        return transformMap[type](selection, transformer)
      } else {
        return defaultTransform(selection)
      }
    }

    function transformer (selection) {
      return options.transformer(selection, transformEntity)
    }

    // select and transform the content, then returns the page object
    return quantum.select(page.content)
      .transform(transformer)
      .then(function (elements) {
        return page.clone({
          content: new HTMLPage(elements)
        })
      })
  }
}

function HTMLPage (elements) {
  this.elements = elements
}

HTMLPage.prototype.stringify = function (options) {
  return dom.stringify(this.elements, {
    embedAssets: options ? options.embedAssets : true,
    assetPath: options ? options.assetPath : undefined
  })
}

function stringify (opts) {
  var options = merge({
    embedAssets: true,
    assetPath: undefined
  }, opts)

  return function (page) {
    return Promise.props({
      file: page.file.withExtension('.html'),
      content: page.content.stringify(options).then(x => x.html)
    }).then(function (changes) {
      return page.clone(changes)
    })
  }
}

// renames name.html to name/index.html and leaves index.html as it is
function htmlRenamer () {
  return function (page) {
    var filenameWithoutExtension = path.basename(page.file.dest).replace('.html', '')
    var root = path.dirname(page.file.dest)
    return page.clone({
      file: page.file.clone({
        dest: filenameWithoutExtension === 'index' ? page.file.dest : path.join(root, filenameWithoutExtension, 'index.html')
      })
    })
  }
}

module.exports.HTMLPage = HTMLPage
module.exports.transforms = transforms
module.exports.prepareTransforms = prepareTransforms
module.exports.stringify = stringify
module.exports.paragraphTransform = paragraphTransform
module.exports.htmlRenamer = htmlRenamer

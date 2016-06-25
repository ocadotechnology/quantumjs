var dom = require('quantum-dom')
var quantum = require('quantum-js')
var unique = require('array-unique')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')
var merge = require('merge')

var types = [
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

var transforms = {}

function entityToElement (type, selection, page, parsePs) {
  var element = page.create(type, selection.has('uid') ? selection.select('uid').ps() : undefined)
  var classId = selection.ps()

  if (selection.has('id')) {
    element.id(selection.select('id').ps())
  } else if (parsePs) {
    var match = classId.match(/#[^\.#]+/)
    if (match) {
      var id = match.map(function (d) {
        return d.substring(1)
      })[0]
      if (id) element.id(id)
    }
  }

  if (selection.has('class')) {
    element.class(selection.select('class').ps())
  } else if (parsePs) {
    var match = classId.match(/(\.[^\.#]+)/g)
    if (match) {
      var clasz = unique(match.map(function (d) {
        return d.substring(1)
      })).join(' ')

      if (clasz) {
        element.class(clasz)
      }
    }
  }

  selection.selectAll('attr').forEach(function (attr) {
    element.attr(attr.ps(), attr.cs())
  })
  return element
}

function setupElement (type, selection, page, transform, parsePs) {
  var element = entityToElement(type, selection, page, parsePs)
  return selection
    .filter(function (selection) {
      return !quantum.select.isSelection(selection) || (selection.type() !== 'id' && selection.type() !== 'class' && selection.type() !== 'attr')
    })
    .transform(transform)
    .then(function (elements) {
      element.add(elements.filter(function (d) {return d}))
    })
    .then(function () {
      return element
    })
}

// define the common element types as entity transforms
types.forEach(function (type) {
  transforms[type] = function (selection, page, transform) {
    return setupElement(type, selection, page, transform, true)
  }
})

transforms.bodyClass = function (selection, page, transform) {
  page.body.class(page.body.class() + ' ' + selection.ps())
  return
}

transforms.classed = function (selection, page, transform) {
  var element = page.get(selection.param(0))
  if (element) {
    element.classed(selection.param(1), selection.param(2))
  }
  return
}

transforms.title = function (selection, page, transform) {
  page.remove('title')
  page.head.add(page.create('title', 'title').text(selection.ps()))
}

transforms.head = function (selection, page, transform) {
  return selection.transform(transform)
    .then(function (elements) {
      page.head.add(elements.filter(function (d) {return d}))
    })
    .then(function () { return undefined })
}

transforms.html = function (selection, page, transform) {
  return page.textNode(selection.cs(), undefined, {escape: false})
}

transforms.script = function (selection, page, transform) {
  page.body.add(page.script(selection.ps()), true)
}

transforms.stylesheet = function (selection, page, transform) {
  page.head.add(page.stylesheet(selection.ps()))
}

transforms.hyperlink = function (selection, page, transform) {
  return setupElement('a', selection, page, transform, false)
    .then(function (element) {
      return element.attr('href', selection.ps())
    })
}

function randomId () {
  var res = new Array(32)
  var alphabet = 'ABCDEF0123456789'
  for (var i = 0; i < 32; i++) {
    res[i] = alphabet[Math.floor(Math.random() * 16)]
  }
  return res.join('')
}

transforms.js = function (selection, page, transforms) {
  page.body.add(page.create('script').text(selection.cs(), true), true)
}

transforms.css = function (selection, page, transforms) {
  page.head.add(page.create('style').text(selection.cs(), true), true)
}

// flattens out namespaced renderers into a single object
function prepareTransforms (transforms, namespace, target) {
  namespace = namespace || ''
  target = target || {}
  for (d in transforms) {
    if (typeof (transforms[d]) == 'function') {
      target[namespace + d] = transforms[d]
      target[d] = transforms[d]
    } else {
      prepareTransforms(transforms[d], namespace + d + '.', target)
    }
  }

  return target
}

function paragraphTransform (selection, page, transform) {
  page.asset('quantum-html.css', __dirname + '/client/quantum-html.css')

  var paragraphs = []
  var currentParagraph = undefined

  selection.content().forEach(function (e) {
    if (e === '') {
      if (currentParagraph) {
        paragraphs.push(currentParagraph)
        currentParagraph = undefined
      }
    } else {
      if (!currentParagraph) {
        currentParagraph = page.create('div').class('qm-html-paragraph')
      }

      if (quantum.select.isEntity(e)) {
        currentParagraph = currentParagraph.add(transform(quantum.select(e))).add(page.textNode(' '))
      } else {
        currentParagraph = currentParagraph.add(page.textNode(e + ' '))
      }
    }
  })

  if (currentParagraph) {
    paragraphs.push(currentParagraph)
    currentParagraph = undefined
  }

  return page.all(paragraphs)
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
  return function (qpage) {
    // create a new page to populate
    var page = dom().addCommonMetaTags()

    // the default transform just makes a text node
    function defaultTransform (selection) {
      return page.textNode(quantum.select.isSelection(selection) ? selection.cs() : selection)
    }

    // renders an selection by looking at its type and selecting the transform from the list
    function transformEntity (selection) {
      var type = quantum.select.isSelection(selection) ? selection.type() : undefined
      if (type in transformMap) {
        return transformMap[type](selection, page, transformer)
      } else {
        return defaultTransform(selection)
      }
    }

    function transformer (selection) {
      return options.transformer(selection, transformEntity)
    }

    // select and transform the content, then returns the page object
    return quantum.select(qpage.content).transform(transformer)
      .then(function (elements) {
        page.body.add(elements.filter(function (d) { return d }))
        return qpage.clone({
          content: page
        })
      })
  }
}

function stringify (opts) {
  var options = merge({
    embedAssets: true,
    assetPath: undefined
  }, opts)

  return function (page) {
    return Promise.props({
      file: page.file.clone({
        dest: page.file.dest.replace('.um', '.html')
      }),
      content: page.content.stringify({
        embedAssets: options.embedAssets,
        assetPath: options.assetPath
      })
    }).then(function (changes) {
      return page.clone(changes)
    })
  }
}

function exportAssets (targetDir, assetObjs) {
  return Promise.all(assetObjs.map(function (obj) {
    return Promise.all(Object.keys(obj).map(function (key) {
      return fs.copyAsync(obj[key], path.join(targetDir, key))
    }))
  }))
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

module.exports.transforms = transforms
module.exports.prepareTransforms = prepareTransforms
module.exports.stringify = stringify
module.exports.exportAssets = exportAssets
module.exports.paragraphTransform = paragraphTransform
module.exports.htmlRenamer = htmlRenamer

module.exports.assets = {
  'quantum-html.css': __dirname + '/client/quantum-html.css'
}

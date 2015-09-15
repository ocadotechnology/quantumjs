var dom          = require('quantum-dom')
var select       = require('quantum-core').select
var hljs         = require('highlight.js')
var umsyntax     = require('./um-syntax.js')
var unique       = require('array-unique')
var coffeescript = require('coffee-script')

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

function entityToElement(type, entity, page, parsePs) {
  var element = page.create(type, entity.has('uid') ? entity.select('uid').ps() : undefined)
  var classId = entity.ps()

  if (entity.has('id')) {
    element.id(entity.select('id').ps())
  } else if(parsePs) {
    var match = classId.match(/#[^\.#]+/)
    if(match) {
      var id = match.map(function(d){
        return d.substring(1)
      })[0]
      if(id) element.id(id)
    }
  }

  if (entity.has('class')) {
    element.class(entity.select('class').ps())
  } else if(parsePs) {
    var match = classId.match(/(\.[^\.#]+)/g)
    if(match){
      var clasz = unique(match.map(function(d){
        return d.substring(1)
      })).join(' ')

      if(clasz) {
        element.class(clasz)
      }
    }
  }

  entity.selectAll('attr').forEach(function(attr){
    element.attr(attr.ps(), attr.cs())
  })
  return element
}

function setupElement(type, entity, page, transform, parsePs) {
  var element = entityToElement(type, entity, page, parsePs)
  return entity
    .filter(function(entity) {
      return entity.type != 'id' && entity.type != 'class' && entity.type != 'attr'
    })
    .transform(transform)
    .then(function(elements){
      element.add(elements.filter(function(d){return d}))
    })
    .then(function(){
      return element
    })
}

// define the common element types as entity transforms
types.forEach(function(type) {
  transforms[type] = function(entity, page, transform) {
    return setupElement(type, entity, page, transform, true)
  }
})

transforms.bodyClass = function(entity, page, transform) {
  page.body.class(page.body.class() + ' ' + entity.ps())
  return
}

transforms.classed = function(entity, page, transform) {
  var element = page.get(entity.params[0])
  if(element) {
    element.classed(entity.params[1], entity.params[2])
  }
  return
}

transforms.head = function(entity, page, transform) {
  return entity.transform(transform)
    .then(function(elements){
      page.head.add(elements.filter(function(d){return d}))
    })
    .then(function(){ return undefined })
}

transforms.html = function(entity, page, transform) {
  return page.textNode(entity.cs())
}

transforms.script = function(entity, page, transform) {
  page.body.add(page.script(entity.ps()), true)
}

transforms.stylesheet = function(entity, page, transform) {
  page.head.add(page.stylesheet(entity.ps()))
}

transforms.hyperlink = function(entity, page, transform) {
  return setupElement('a', entity, page, transform, false)
    .then(function(element) {
      return element.attr('href', entity.ps())
    })
}

function randomId() {
  var res = new Array(32)
  var alphabet = 'ABCDEF0123456789'
  for(var i=0; i<32; i++) {
    res[i] = alphabet[Math.floor(Math.random()*16)]
  }
  return res.join('')
}

transforms.js = function(entity, page, transforms) {
  page.body.add(page.create('script').text(entity.cs()), true)
}

transforms.coffee = function(entity, page, transforms) {
  page.body.add(page.create('script').text(coffeescript.compile(entity.cs())), true)
}

transforms.css = function(entity, page, transforms) {
  page.head.add(page.create('style').text(entity.cs()), true)
}

//TODO
// transforms.scss = function(entity, page, transforms) {
//   page.head.add(page.create('style').text(entity.cs()), true)
// }

hljs.registerLanguage('um', umsyntax)

function highlightCode(language, code){
  if (language) {
    return hljs.highlight(language, code).value
  } else {
    return hljs.highlightAuto(code).value
  }
}

transforms.codeblock = function(entity, page, transform) {
  return page.addAssets({css: {
      'code-highlight.css': __dirname + '/client/code-highlight.css'
    }}).then(function() {

      return page.create('div').class('codeblock')
        .add(page.create('pre').text(highlightCode(entity.ps(), entity.cs())))
    })
}

transforms.code = function(entity, page, transform) {
  return page.addAssets({css: {
      'code-highlight.css': __dirname + '/client/code-highlight.css'
    }}).then(function() {
      return page.create('code')
        .class('code')
        .text(highlightCode(entity.ps(), entity.cs()))
    })
}

// flattens out namespaced renderers into a single object
function prepareTransforms(transforms, namespace, target) {
  namespace = namespace || ''
  target = target || {}
  for (d in transforms) {
    if (typeof(transforms[d]) == 'function') {
      target[namespace + d] = transforms[d]
      target[d] = transforms[d]
    } else {
      prepareTransforms(transforms[d], namespace + d + '.', target)
    }
  }

  return target
}

// returns the transform function that converts parsed um source to virtual dom.
// returns a new transform function for the transforms object supplied. this curried
// function makes that api a bit more fluid.
module.exports = function(inputTransforms) {

  // holds all transforms with namespace variants and non namespace variants
  var transformMap = prepareTransforms(inputTransforms || transforms)

  // the actual transform function that turns parsed content into html content
  return function(obj) {

    // create a new page to populate
    var page = dom().addCommonMetaTags()

    // the default transform just makes a text node
    function defaultTransform(entity) {
      return page.textNode(select.isEntity(entity) ? entity.cs() : entity)
    }

    // renders an entity by looking at its type and selecting the transform from the list
    function transformEntity(entity) {
      if (entity.type in transformMap) {
        return transformMap[entity.type](entity, page, transformEntity)
      } else {
        return defaultTransform(entity)
      }
    }

    // select and transform the content, then returns the page object
    return select(obj.content).transform(transformEntity)
      .then(function(elements){
        page.body.add(elements.filter(function(d){ return d }))
        return {
          filename: obj.filename,
          content: page
        }
      })
  }
}


module.exports.transforms = transforms
module.exports.prepareTransforms = prepareTransforms

function rename(filename) {
  return filename.replace('.um', '.html')
}

// renders
module.exports.stringify = function(options) {
  return function(obj){
    return {
      filename: rename(obj.filename),
      content: obj.content.stringify()
    }
  }
}

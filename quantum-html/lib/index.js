'use-strict'
const path = require('path')
const unique = require('array-unique')
const Promise = require('bluebird')
const merge = require('merge')
const quantum = require('quantum-js')
const dom = require('quantum-dom')

function transforms (opts) {
  const elementTransforms = {}
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

    selection.selectAll('attr').forEach((attr) => element.attr(attr.ps(), attr.cs()))
    return element
  }

  const attributeEntities = [
    'attr',
    'class',
    'id'
  ]

  function setupElement (type, selection, transform, parsePs) {
    const element = entityToElement(type, selection, parsePs)
    return selection
      .filter((entity) => attributeEntities.indexOf(entity.type) === -1)
      .transform(transform)
      .then((elements) => element.add(elements.filter(d => d)))
      .then(() => element)
  }

  // define the common element types as entity transforms
  types.forEach((type) => {
    elementTransforms[type] = (selection, transform) => setupElement(type, selection, transform, true)
  })

  const bodyClassed = (selection, transform) => {
    return dom.bodyClassed(selection.ps(), selection.cs() !== 'false')
  }

  const title = (selection, transform) => {
    return dom.head(dom.create('title').attr('name', selection.ps()), {id: 'title'})
  }

  const head = (selection, transform) => {
    return selection.transform(transform)
      .then((elements) => elements.filter(d => d).map(e => dom.head(e)))
  }

  const html = (selection, transform) => dom.textNode(selection.cs(), {escape: false})
  const script = (selection, transform) => dom.create('script').attr('src', selection.ps())

  const stylesheet = (selection, transform) => {
    return dom.head(dom.create('link')
      .attr('href', selection.ps())
      .attr('rel', 'stylesheet'))
  }

  const hyperlink = (selection, transform) => {
    return setupElement('a', selection, transform, false)
      .then((element) => element.attr('href', selection.ps()))
  }

  const js = (selection, transforms) => dom.create('script').text(selection.cs(), {escape: false})
  const css = (selection, transforms) => dom.head(dom.create('style').text(selection.cs(), {escape: false}))

  return Object.freeze(merge(elementTransforms, {
    bodyClassed,
    title,
    head,
    html,
    script,
    stylesheet,
    hyperlink,
    js,
    css
  }))
}// flattens out namespaced renderers into a single object
function prepareTransforms (transforms, namespace, target) {
  const resolvedNamespace = namespace || ''
  const resolvedTarget = target || {}
  for (const d in transforms) {
    if (typeof (transforms[d]) === 'function') {
      resolvedTarget[resolvedNamespace + d] = transforms[d]
      resolvedTarget[d] = transforms[d]
    } else {
      prepareTransforms(transforms[d], resolvedNamespace + d + '.', resolvedTarget)
    }
  }

  return resolvedTarget
}

// returns the transform function that converts parsed um source to virtual dom.
// returns a new transform function for the transforms object supplied. this curried
// function makes that api a bit more fluid.
function pipeline (opts) {
  const options = merge({
    transforms: transforms(),
    transformer: (selection, defaultTransformer) => defaultTransformer(selection)
  }, opts)

  // holds all transforms with namespace variants and non namespace variants
  const transformMap = prepareTransforms(options.transforms)

  // the actual transform function that turns parsed content into html content
  return (page) => {
    // the default transform just makes a text node
    function defaultTransform (selection) {
      return quantum.select.isSelection(selection) ? selection.cs() : selection
    }

    // renders an selection by looking at its type and selecting the transform from the list
    function transformEntity (selection) {
      const type = quantum.select.isSelection(selection) ? selection.type() : undefined
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
      .then((elements) => page.clone({ content: new HTMLPage(elements) }))
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
  const options = merge({
    embedAssets: true,
    assetPath: undefined
  }, opts)

  return (page) => {
    return Promise.props({
      file: page.file.withExtension('.html'),
      content: page.content.stringify(options).then(x => x.html)
    })
      .then((changes) => page.clone(changes))
  }
}

function paragraphTransform (selection, transform) {
  const paragraphs = [
    dom.asset({
      url: '/assets/quantum-html.css',
      file: path.join(__dirname, '../assets/quantum-html.css'),
      shared: true
    })
  ]

  let currentParagraph = undefined

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

  return paragraphs
}

// renames name.html to name/index.html and leaves index.html as it is
function htmlRenamer () {
  return (page) => {
    const filenameWithoutExtension = path.basename(page.file.dest).replace('.html', '')
    const rootPath = path.dirname(page.file.dest)
    return page.clone({
      file: page.file.clone({
        dest: filenameWithoutExtension === 'index' ? page.file.dest : path.join(rootPath, filenameWithoutExtension, 'index.html')
      })
    })
  }
}

module.exports = pipeline
module.exports.transforms = transforms

module.exports.HTMLPage = HTMLPage
module.exports.prepareTransforms = prepareTransforms
module.exports.stringify = stringify
module.exports.paragraphTransform = paragraphTransform
module.exports.htmlRenamer = htmlRenamer

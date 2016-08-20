/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Api
  ===

  HTML Transforms for api docs.

*/

const quantum = require('quantum-js')
const dom = require('quantum-dom')
const merge = require('merge')
const html = require('quantum-html')
const path = require('path')

module.exports = (opts) => {
  const defaultOptions = {
    typeLinks: {},
    // XXX: change to array, ditch order property
    tags: {
      added: {
        tagText: 'added', // The text to display on tags
        order: 4
      },
      updated: {
        tagText: 'updated',
        order: 3
      },
      deprecated: {
        tagText: 'deprecated',
        order: 2
      },
      removed: {
        tagText: 'removed',
        order: 1
      }
    }
  }

  const options = merge.recursive(defaultOptions, opts)
  const tagNames = Object.keys(options.tags).sort((a, b) => options.tags[a].order - options.tags[b].order)

  /* Adds links for parameterised types (eg. Promise[Array[String]]) */
  function addParameterisedTypeLinks (container, typeString) {
    addSingleTypeLink(container, typeString.slice(0, typeString.indexOf('[')))
    const innerTypeString = typeString.slice(typeString.indexOf('[') + 1, typeString.lastIndexOf(']'))
    container.add('[')
    addTypeLink(container, innerTypeString)
    container.add(']')
    return container
  }

  /* Adds types (with links to documentation for the type if possible) to an element */
  function addSingleTypeLink (container, typeString) {
    const types = typeString.split('/')
    types.forEach((type, index) => {
      if (type in options.typeLinks) {
        container.add(dom.create('a').class('qm-api-type-link').attr('href', options.typeLinks[type]).text(type))
      } else {
        container.add(type)
      }
      if (index !== types.length - 1) {
        container.add(' / ')
      }
    })
  }

  /* Adds types to a string (eg. Array[String]), taking care of parameterised types `Array[T]`, or single types `String` */
  function addTypeLink (container, typeString) {
    if (typeString.indexOf('[') > -1) {
      addParameterisedTypeLinks(container, typeString)
    } else {
      addSingleTypeLink(container, typeString)
    }
  }

  /* Creates a span containing one or more / separated types (complete with links for known types) */
  function createType (typeString) {
    if (typeString !== undefined && typeString !== '') {
      const container = dom.create('span')
      addTypeLink(container, typeString)
      return container
    }
  }

  function createTagClasses (selection) {
    const childUpdated = !selection.has(tagNames) && selection.has(tagNames, {recursive: true})

    const tags = []
    if (selection.has('added')) tags.push('added')
    if (selection.has('deprecated')) tags.push('deprecated')
    if (selection.has('removed')) tags.push('removed')
    if (selection.has('updated') || childUpdated) tags.push('updated')

    return tags
  }

  function createTags (selection) {
    const tags = dom.create('span').class('qm-api-header-tags')

    createTagClasses(selection).forEach((name) => {
      tags.add(dom.create('span').class('qm-api-tag qm-api-tag-' + name).text(options.tags[name].tagText))
    })

    return tags
  }

  // General template for headers (handles the tags automatically, just provide the details span)
  function createHeader (type, details, selection, transforms) {
    const tagClasses = createTagClasses(selection).map((name) => 'qm-api-' + name).join(' ')

    return dom.create('div').class('qm-api-item-header qm-api-' + type + '-header')
      .add(details.class('qm-api-header-details' + (tagClasses ? ' ' + tagClasses : '')))
      .add(createTags(selection))
  }

  function createNotice (type, title) {
    return (selection, transforms) => {
      if (selection.has(type)) {
        const notice = selection.select(type)
        notice.removeAll('issue')

        if (notice.hasContent()) {
          return dom.create('div').class('qm-api-notice qm-api-notice-' + type)
            .add(dom.create('div').class('qm-api-notice-header').text(title))
            .add(dom.create('div').class('qm-api-notice-body')
              .add(notice.transform(transforms))
          )
        }
      }
    }
  }

  function sortEntities (a, b) {
    if (a.params[0] < b.params[0]) return -1
    else if (a.params[0] > b.params[0]) return 1
  }

  function organisedEntity (selection) {
    const added = []
    const updated = []
    const existing = []
    const deprecated = []
    const removed = []

    selection.content().forEach(entity => {
      if (quantum.select.isEntity(entity)) {
        const selection = quantum.select(entity)
        if (selection.has('removed')) {
          removed.push(entity)
        } else if (selection.has('deprecated')) {
          deprecated.push(entity)
        } else if (selection.has('updated')) {
          updated.push(entity)
        } else if (selection.has('added')) {
          added.push(entity)
        } else {
          existing.push(entity)
        }
      }
    })

    const sortedAdded = added.sort(sortEntities)
    const sortedUpdated = updated.sort(sortEntities)
    const sortedExisting = existing.sort(sortEntities)
    const sortedDeprecated = deprecated.sort(sortEntities)
    const sortedRemoved = removed.sort(sortEntities)

    const newContent = sortedAdded
      .concat(sortedUpdated)
      .concat(sortedExisting)
      .concat(sortedDeprecated)
      .concat(sortedRemoved)

    return quantum.select({
      type: selection.type(),
      params: selection.params(),
      content: newContent
    })
  }

  // creates a group of items (like all the methods on a prototype, or all the properties on an object)
  function createItemGroup (type, title, options) {
    return (selection, transforms) => {
      const hasType = Array.isArray(type) ? type.some(t => selection.has(t)) : selection.has(type)

      if (hasType) {
        const filtered = (!options || !options.noSort) ? organisedEntity(selection.filter(type)) : selection.filter(type)
        const firstType = Array.isArray(type) ? type[0] : type

        return dom.create('div').class('qm-api-' + firstType + '-group')
          .add(dom.create('h2').text(title))
          .add(filtered.transform(transforms))
      }
    }
  }

  // creates a qm collapsible
  function createCollapsible (collapsibleClass, header, content) {
    return dom.create('div').class('qm-api-collapsible qm-api-item ' + collapsibleClass)
      .add(dom.create('div').class('qm-api-collapsible-heading')
        .add(dom.create('div').class('qm-api-collapsible-toggle')
          .add(dom.create('i').class('qm-api-chevron-icon')))
        .add(dom.create('div').class('qm-api-collapsible-head')
          .add(header)))
      .add(dom.create('div').class('qm-api-collapsible-content')
        .add(content))
  }

  function createItemBuilder (opts) {
    return (itemClass) => {
      const standard = [deprecated, removed]

      return (selection, transforms) => {
        // render as something else if the type parameter matches
        // (eg @property bob [Function] should be rendered as a function)
        const others = opts.renderAsOther || {}
        const otherKeys = Object.keys(others)
        for (let i = 0; i < otherKeys.length; i++) {
          const name = otherKeys[i]
          if (selection.param(1) === name || (selection.param(1) === undefined && selection.param(0) === name)) {
            return others[name](itemClass)(selection, transforms)
          }
        }

        const content = dom.create('div').class('qm-api-item-content')

        standard.concat(opts.content).forEach((builder) => content.add(builder(selection, transforms)))

        if (opts.header) {
          const type = selection.type()
          const isOptional = type[type.length - 1] === '?'

          const header = dom.create('div')
            .class('qm-api-item-head')
            .classed('qm-api-optional', isOptional)

          opts.header.forEach((builder) => header.add(builder(selection, transforms)))

          const extraClasses = selection.isEmpty() ? ' qm-api-item-no-description' : ''

          return createCollapsible(itemClass + extraClasses, header, content)
        } else {
          return content
        }
      }
    }
  }

  /* header building blocks */

  // creates a header for function type items
  function functionHeader (selection, transforms) {
    const name = dom.create('span').class('qm-api-function-name').text(selection.type() === 'constructor' ? 'constructor' : selection.param(0))

    const params = selection.selectAll(['param', 'param?']).map((param) => {
      const isOptional = param.type()[param.type().length - 1] === '?'
      return dom.create('span').class(isOptional ? 'qm-api-function-param qm-api-optional' : 'qm-api-function-param')
        .add(dom.create('span').class('qm-api-function-param-name').text(param.param(0)))
        .add(dom.create('span').class('qm-api-function-param-type').add(createType(param.param(1))))
    })

    const returnsSelection = selection
      .selectAll('returns')
      .filter(sel => !sel.has('removed'))[0]

    let retns
    if (returnsSelection) {
      retns = dom.create('span').class('qm-api-function-returns').add(createType(returnsSelection.ps()))
    }

    const details = dom.create('span')
      .add(name)
      .add(dom.create('span').class('qm-api-function-params').add(params))
      .add(retns)

    return createHeader('function', details, selection, transforms)
  }

  // creates a header for property type items
  function propertyHeader (selection, transforms) {
    const details = dom.create('span')
      .add(dom.create('span').class('qm-api-property-name').text(selection.param(0) || ''))
      .add(dom.create('span').class('qm-api-property-type').add(createType(selection.param(1))))

    return createHeader('property', details, selection, transforms)
  }

  function prototypeHeader (selection, transforms) {
    let details = dom.create('span')
      .add(dom.create('span').class('qm-api-prototype-name').text(selection.param(0) || ''))

    const extendsEntities = selection.selectAll('extends')

    if (extendsEntities.length > 0) {
      details = details.add(dom.create('span').class('qm-api-prototype-extends').text('extends'))

      extendsEntities.forEach((ent) => {
        const extender = dom.create('span')
          .class('qm-api-prototype-extends-type')
          .add(createType(ent.ps()))
        details = details.add(extender)
      })
    }

    return createHeader('prototype', details, selection, transforms)
  }

  // creates a header for type items
  function typeHeader (selection, transforms) {
    const details = dom.create('span')
      .add(dom.create('span').class('qm-api-type-name').add(createType(selection.param(0))))

    return createHeader('type', details, selection, transforms)
  }

  /* content building blocks */

  function description (selection, transforms) {
    const descriptionClass = 'qm-api-description'
    if (selection.has('description')) {
      return dom.create('div')
        .class(descriptionClass)
        .add(html.paragraphTransform(selection.select('description'), transforms))
    } else {
      return dom.create('div')
        .class(descriptionClass)
        .text(selection.cs().trim())
    }
  }

  function extras (selection, transforms) {
    return dom.create('div').class('qm-api-extras').add(
      dom.all(selection.selectAll('extra').map((e) => {
        return dom.create('div').class('qm-api-extra')
          .add(html.paragraphTransform(e, transforms))
      })))
  }

  function defaultValue (selection, transforms) {
    if (selection.has('default')) {
      return dom.create('div').class('qm-api-default')
        .add(dom.create('span').class('qm-api-default-key').text('Default: '))
        .add(dom.create('span').class('qm-api-default-value').add(selection.select('default').ps().trim()))
        .add(selection.select('default').transform(transforms))
    }
  }

  function groups (selection, transforms) {
    if (selection.has('group')) {
      const sortedEntity = organisedEntity(selection.filter('group'))
      return dom.create('div').class('qm-api-group-container')
        .add(dom.all(sortedEntity.selectAll('group').map((groupSelection) => {
          return dom.create('div').class('qm-api-group')
            .add(dom.create('h2').text(groupSelection.ps()))
            .add(dom.create('div').class('qm-api-group-content')
              .add(description(groupSelection, transforms))
              .add(groupSelection.filter(entity => entity.type !== 'description').transform(transforms)))
        })))
    }
  }

  const deprecated = createNotice('deprecated', 'Deprecated')
  const removed = createNotice('removed', 'Removed')

  const prototypes = createItemGroup('prototype', 'Prototypes')
  const constructors = createItemGroup('constructor', 'Constructors')
  const objects = createItemGroup('object', 'Objects')
  const params = createItemGroup(['param', 'param?'], 'Arguments', {noSort: true})
  const properties = createItemGroup(['property', 'property?'], 'Properties')
  const methods = createItemGroup('method', 'Methods')
  const events = createItemGroup('event', 'Events')
  const functions = createItemGroup('function', 'Functions')
  const returns = createItemGroup('returns', 'Returns')
  const classes = createItemGroup('class', 'Classes')
  const extraClasses = createItemGroup('extraclass', 'Extra Classes')
  const childClasses = createItemGroup('childclass', 'Child Classes')

  /* item builders */

  const createApiLike = createItemBuilder({
    content: [ description, extras, groups, properties, prototypes, objects, functions, classes ]
  })

  const createGroupLike = createItemBuilder({
    content: [ groups, params, properties, prototypes, objects, functions, methods, classes, events ]
  })

  const createConstructorLike = createItemBuilder({
    header: [ functionHeader ],
    content: [ description, extras, params ]
  })

  const createFunctionLike = createItemBuilder({
    header: [ functionHeader ],
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  const createObjectLike = createItemBuilder({
    header: [ propertyHeader ],
    content: [ description, extras, defaultValue, groups, properties, prototypes, functions, methods ]
  })

  const createPropertyLike = createItemBuilder({
    header: [ propertyHeader ],
    content: [ description, extras, defaultValue ],
    renderAsOther: { 'Function': createFunctionLike, 'Object': createObjectLike }
  })

  const createClassLike = createItemBuilder({
    header: [ typeHeader ],
    content: [ description, extras, groups, classes, extraClasses, childClasses ]
  })

  const createTypeLike = createItemBuilder({
    header: [ typeHeader ],
    content: [ description, extras ],
    renderAsOther: { 'Function': createFunctionLike, 'Object': createObjectLike }
  })

  const createPrototypeLike = createItemBuilder({
    header: [ prototypeHeader ],
    content: [ description, extras, defaultValue, constructors, groups, properties, events, methods, functions ]
  })

  /* transforms */

  function api (selection, transforms) {
    return createApiLike('qm-api')(selection, transforms)
      .add(dom.asset({
        url: '/assets/quantum-api.css',
        file: path.join(__dirname, 'assets/quantum-api.css'),
        shared: true
      }))
      .add(dom.asset({
        url: '/assets/quantum-api.js',
        file: path.join(__dirname, '/assets/quantum-api.js'),
        shared: true
      }))
  }

  return Object.freeze({
    api: api,
    group: createGroupLike('qm-api-group'),
    prototype: createPrototypeLike('qm-api-prototype'),
    object: createObjectLike('qm-api-object'),
    method: createFunctionLike('qm-api-method'),
    function: createFunctionLike('qm-api-function'),
    constructor: createConstructorLike('qm-api-constructor'),
    param: createPropertyLike('qm-api-param'),
    'param?': createPropertyLike('qm-api-param'),
    property: createPropertyLike('qm-api-property'),
    'property?': createPropertyLike('qm-api-property'),
    event: createPropertyLike('qm-api-event'),
    returns: createTypeLike('qm-api-returns'),
    class: createClassLike('qm-api-class'),
    extraclass: createClassLike('qm-api-extraclass'),
    childclass: createClassLike('qm-api-childclass')
  })
}

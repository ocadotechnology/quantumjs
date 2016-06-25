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

var quantum = require('quantum-js')
var merge = require('merge')

module.exports = function (opts) {
  var defaultOptions = {
    typeLinks: {},
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

  var options = merge.recursive(defaultOptions, opts)
  var tagNames = Object.keys(options.tags).sort(function (a, b) {return options.tags[a].order - options.tags[b].order })

  /* Adds links for parameterised types (eg. Promise[Array[String]]) */
  function addParameterisedTypeLinks (container, typeString, page) {
    addSingleTypeLink(container, typeString.slice(0, typeString.indexOf('[')), page)
    var innerTypeString = typeString.slice(typeString.indexOf('[') + 1, typeString.lastIndexOf(']'))
    container.add('[')
    addTypeLink(container, innerTypeString, page)
    container.add(']')
    return container
  }

  /* Adds types (with links to documentation for the type if possible) to an element */
  function addSingleTypeLink (container, typeString, page) {
    var types = typeString.split('/')
    types.forEach(function (type, index) {
      if (type in options.typeLinks) {
        container.add(page.create('a').class('qm-api-type-link').attr('href', options.typeLinks[type]).text(type))
      } else {
        container.add(type)
      }
      if (index !== types.length - 1) {
        container.add(' / ')
      }
    })
  }

  /* Adds types to a string (eg. Array[String]), taking care of parameterised types `Array[T]`, or single types `String` */
  function addTypeLink (container, typeString, page) {
    if (typeString.indexOf('[') > -1) {
      addParameterisedTypeLinks(container, typeString, page)
    } else {
      addSingleTypeLink(container, typeString, page)
    }
  }

  // creates a span containing one or more / separated types (complete with links for known types)
  function createType (typeString, page) {
    if (typeString !== undefined && typeString !== '') {
      var container = page.create('span')
      addTypeLink(container, typeString, page)
      return container
    }
  }

  function createTagClasses (selection) {
    var childUpdated = !selection.has(tagNames) && selection.has(tagNames, {recursive: true})

    var tags = []
    if (selection.has('added')) tags.push('added')
    if (selection.has('deprecated')) tags.push('deprecated')
    if (selection.has('removed')) tags.push('removed')
    if (selection.has('updated') || childUpdated) tags.push('updated')

    return tags
  }

  function createTags (selection, page) {
    var tags = page.create('span').class('qm-api-header-tags')

    createTagClasses(selection).forEach(function (name) {
      tags.add(page.create('span').class('qm-api-tag qm-api-tag-' + name).text(options.tags[name].tagText))
    })

    return tags
  }

  // general template for headers (handles the tags automatically, just provide the details span)
  function createHeader (type, details, selection, page, transforms) {
    var tagClasses = createTagClasses(selection).map(function (name) { return 'qm-api-' + name }).join(' ')

    return page.create('div').class('qm-api-item-header qm-api-' + type + '-header')
      .add(details.class('qm-api-header-details' + (tagClasses ? ' ' + tagClasses : '')))
      .add(createTags(selection, page))
  }

  function createNotice (type, title) {
    return function (selection, page, transforms) {
      if (selection.has(type)) {
        var notice = selection.select(type)
        notice.removeAll('issue')

        if (notice.hasContent()) {
          return page.create('div').class('qm-api-notice qm-api-notice-' + type)
            .add(page.create('div').class('qm-api-notice-header').text(title))
            .add(page.create('div').class('qm-api-notice-body')
              .add(notice.transform(transforms))
          )
        }
      }
    }
  }

  function sortEntities (a, b) {
    if (a.param(0) < b.param(0)) return -1
    else if (a.param(0) > b.param(0)) return 1
  }

  function organisedEntity (selection) {
    var added = []
    var updated = []
    var existing = []
    var deprecated = []
    var removed = []

    selection.content().forEach(function (e) {
      if (quantum.select.isEntity(e)) {
        var e = quantum.select(e)
        if (e.has('removed')) {
          removed.push(e)
        } else if (e.has('deprecated')) {
          deprecated.push(e)
        } else if (e.has('updated')) {
          updated.push(e)
        } else if (e.has('added')) {
          added.push(e)
        } else {
          existing.push(e)
        }
      } else {
        // console.log(e)
      }
    })

    var sortedAdded = added.sort(sortEntities)
    var sortedUpdated = updated.sort(sortEntities)
    var sortedExisting = existing.sort(sortEntities)
    var sortedDeprecated = deprecated.sort(sortEntities)
    var sortedRemoved = removed.sort(sortEntities)

    var newContent = sortedAdded.concat(
      sortedUpdated.concat(
        sortedExisting.concat(
          sortedDeprecated.concat(
            sortedRemoved
          )
        )
      )
    )

    return quantum.select({
      type: selection.type(),
      params: selection.params(),
      content: newContent
    })
  }

  // creates a group of items (like all the methods on a prototype, or all the properties on an object)
  function createItemGroup (type, title, options) {
    return function (selection, page, transforms) {
      var hasType = Array.isArray(type) ? type.every(function (t) { return selection.has(t) }) : selection.has(type)
      if (hasType) {
        var filtered = selection.filter(type)
        if (!options || !options.noSort) filtered = organisedEntity(filtered)
        var firstType = Array.isArray(type) ? type[0] : type
        return page.create('div').class('qm-api-' + firstType + '-group')
          .add(page.create('h2').text(title))
          .add(filtered.transform(transforms))
      }
    }
  }

  // creates a qm collapsible
  function createCollapsible (page, clas, header, content) {
    return page.create('div').class('qm-api-collapsible qm-api-item ' + clas)
      .add(page.create('div').class('qm-api-collapsible-heading')
        .add(page.create('div').class('qm-api-collapsible-toggle')
          .add(page.create('i').class('qm-api-chevron-icon')))
        .add(page.create('div').class('qm-api-collapsible-head')
          .add(header)))
      .add(page.create('div').class('qm-api-collapsible-content')
        .add(content))
  }

  function createItemBuilder (opts) {
    return function (clas) {
      var standard = [deprecated, removed]

      return function (selection, page, transforms) {
        // render as something else if the type parameter matches
        // (eg @property bob [Function] should be rendered as a function)
        var others = opts.renderAsOther || {}
        var otherKeys = Object.keys(others)
        for (var i = 0; i < otherKeys.length; i++) {
          var name = otherKeys[i]
          if (selection.param(1) === name || (selection.param(1) === undefined && selection.param(0) === name)) {
            return others[name](clas)(selection, page, transforms)
          }
        }

        var content = page.create('div').class('qm-api-item-content')

        standard.concat(opts.content).forEach(function (builder) {
          content.add(builder(selection, page, transforms))
        })

        if (opts.header) {
          // XXX: do optional check

          var extraHeaderClasses = (selection.type()[selection.type().length - 1] === '?') ? ' qm-api-optional' : ''
          var header = page.create('div').class('qm-api-item-head' + extraHeaderClasses)

          opts.header.forEach(function (builder) {
            header.add(builder(selection, page, transforms))
          })

          var extraClasses = selection.isEmpty() ? ' qm-api-item-no-description' : ''
          return createCollapsible(page, clas + extraClasses, header, content)
        } else {
          return content
        }
      }
    }
  }

  /* header building blocks */

  // creates a header for function type items
  function functionHeader (selection, page, transforms) {
    var name = page.create('span').class('qm-api-function-name').text(selection.type() === 'constructor' ? 'constructor' : selection.param(0))

    var params = selection.selectAll(['param', 'param?']).map(function (param) {
      var isOptional = param.type()[param.type().length - 1] === '?'
      return page.create('span').class(isOptional ? 'qm-api-function-param qm-api-optional' : 'qm-api-function-param')
        .add(page.create('span').class('qm-api-function-param-name').text(param.param(0)))
        .add(page.create('span').class('qm-api-function-param-type').add(createType(param.param(1), page)))
    })

    var returnsSelection = selection.selectAll('returns').filter(function (sel) {
      return !sel.has('removed')
    })[0]

    if (returnsSelection) {
      var returns = page.create('span').class('qm-api-function-returns').add(createType(returnsSelection.ps(), page))
    }

    var details = page.create('span')
      .add(name)
      .add(page.create('span').class('qm-api-function-params').add(params))
      .add(returns)

    return createHeader('function', details, selection, page, transforms)
  }

  // creates a header for property type items
  function propertyHeader (selection, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-property-name').text(selection.param(0) || ''))
      .add(page.create('span').class('qm-api-property-type').add(createType(selection.param(1), page)))

    return createHeader('property', details, selection, page, transforms)
  }

  function prototypeHeader (selection, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-prototype-name').text(selection.param(0) || ''))

    var extendsEntities = selection.selectAll('extends')

    if (extendsEntities.length > 0) {
      details = details.add(page.create('span').class('qm-api-prototype-extends').text('extends'))

      extendsEntities.forEach(function (ent) {
        var extender = page.create('span')
          .class('qm-api-prototype-extends-type')
          .add(createType(ent.ps(), page))
        details = details.add(extender)
      })
    }

    return createHeader('prototype', details, selection, page, transforms)
  }

  // creates a header for entity type items
  function entityHeader (selection, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-entity-name').text('@' + selection.param(0) || ''))
      .add(page.create('span').class('qm-api-entity-params').text(selection.select('params').ps()))
      .add(page.create('span').class('qm-api-entity-content').text(selection.select('params').cs()))

    return createHeader('entity', details, selection, page, transforms)

  }

  // creates a header for type items
  function typeHeader (selection, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-type-name').add(createType(selection.param(0), page)))

    return createHeader('type', details, selection, page, transforms)
  }

  /* content building blocks */

  function description (selection, page, transforms) {
    if (selection.has('description')) {
      return page.create('div').class('qm-api-description').add(selection.select('description').transform(transforms))
    } else {
      return page.create('div').class('qm-api-description').text(selection.cs().trim())
    }
  }

  function extras (selection, page, transforms) {
    return page.create('div').class('qm-api-extras').add(
      page.all(selection.selectAll('extra').map(function (e) {
        return page.create('div').class('qm-api-extra')
          .add(e.transform(transforms))
      })))
  }

  function defaultValue (selection, page, transforms) {
    if (selection.has('default')) {
      return page.create('div').class('qm-api-default')
        .add(page.create('span').class('qm-api-default-key').text('Default: '))
        .add(page.create('span').class('qm-api-default-value').add(selection.select('default').ps().trim()))
        .add(selection.select('default').transform(transforms))
    }
  }

  function groups (selection, page, transforms) {
    if (selection.has('group')) {
      var sortedEntity = organisedEntity(selection.filter('group'))
      return page.create('div').class('qm-api-group-container')
        .add(page.all(sortedEntity.selectAll('group').map(function (e) {
          return page.create('div').class('qm-api-group')
            .add(page.create('h2').text(e.ps()))
            .add(page.create('div').class('qm-api-group-content')
              .add(description(e, page, transforms))
              .add(e.filter(function (e) {return e.type() !== 'description'}).transform(transforms)))
        })))
    }
  }

  var deprecated = createNotice('deprecated', 'Deprecated')
  var removed = createNotice('removed', 'Removed')

  var prototypes = createItemGroup('prototype', 'Prototypes')
  var constructors = createItemGroup('constructor', 'Constructors')
  var objects = createItemGroup('object', 'Objects')
  var params = createItemGroup(['param', 'param?'], 'Arguments', {noSort: true})
  var properties = createItemGroup(['property', 'property?'], 'Properties')
  var methods = createItemGroup('method', 'Methods')
  var events = createItemGroup('event', 'Events')
  var functions = createItemGroup('function', 'Functions')
  var returns = createItemGroup('returns', 'Returns')
  var classes = createItemGroup('class', 'Classes')
  var extraClasses = createItemGroup('extraclass', 'Extra Classes')
  var childClasses = createItemGroup('childclass', 'Child Classes')
  var entities = createItemGroup('entity', 'Entities')

  /* item builders */

  var createApiLike = createItemBuilder({
    content: [ description, extras, groups, properties, prototypes, objects, functions, classes, entities ]
  })

  var createGroupLike = createItemBuilder({
    content: [ groups, params, properties, prototypes, objects, functions, methods, classes, events, entities ]
  })

  var createConstructorLike = createItemBuilder({
    header: [ functionHeader ],
    content: [ description, extras, params ]
  })

  var createFunctionLike = createItemBuilder({
    header: [ functionHeader ],
    content: [ description, extras, defaultValue, params, groups, events, returns ]
  })

  var createObjectLike = createItemBuilder({
    header: [ propertyHeader ],
    content: [ description, extras, defaultValue, groups, properties, prototypes, functions, methods ]
  })

  var createPropertyLike = createItemBuilder({
    header: [ propertyHeader ],
    content: [ description, extras, defaultValue ],
    renderAsOther: { 'Function': createFunctionLike, 'Object': createObjectLike }
  })

  var createClassLike = createItemBuilder({
    header: [ typeHeader ],
    content: [ description, extras, groups, classes, extraClasses, childClasses ]
  })

  var createTypeLike = createItemBuilder({
    header: [ typeHeader ],
    content: [ description, extras ],
    renderAsOther: { 'Function': createFunctionLike, 'Object': createObjectLike }
  })

  var createPrototypeLike = createItemBuilder({
    header: [ prototypeHeader ],
    content: [ description, extras, defaultValue, constructors, groups, properties, events, methods, functions ]
  })

  var createEntityLike = createItemBuilder({
    header: [ entityHeader ],
    content: [ description, extras, groups, entities ],
  })

  /* transforms */

  function api (selection, page, transforms) {
    page
      .asset('quantum-api.css', __dirname + '/client/quantum-api.css')
      .asset('quantum-api.js', __dirname + '/client/quantum-api.js')
    return createApiLike('qm-api')(selection, page, transforms)
  }

  return {
    'api': api,
    'group': createGroupLike('qm-api-group'),
    'prototype': createPrototypeLike('qm-api-prototype'),
    'object': createObjectLike('qm-api-object'),
    'method': createFunctionLike('qm-api-method'),
    'function': createFunctionLike('qm-api-function'),
    'constructor': createConstructorLike('qm-api-constructor'),
    'param': createPropertyLike('qm-api-param'),
    'param?': createPropertyLike('qm-api-param'),
    'property': createPropertyLike('qm-api-property'),
    'property?': createPropertyLike('qm-api-property'),
    'event': createPropertyLike('qm-api-event'),
    'returns': createTypeLike('qm-api-returns'),
    'class': createClassLike('qm-api-class'),
    'extraclass': createClassLike('qm-api-extraclass'),
    'childclass': createClassLike('qm-api-childclass'),
    'entity': createEntityLike('qm-api-entity')
  }
}

module.exports.assets = {
  'quantum-api.css': __dirname + '/client/quantum-api.css',
  'quantum-api.js': __dirname + '/client/quantum-api.js'
}

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

module.exports = function (options) {
  options = options || {}
  var types = options.types || {}

  function matchBrackets (container, string, page) {
    container = typeLookup(container, string.slice(0, string.indexOf('[')), page)
    var match = string.slice(string.indexOf('[') + 1, string.lastIndexOf(']'))
    container = container.add('[')
    if (match.indexOf('[') > -1) {
      container = matchBrackets(container, match, page)
    } else {
      container = typeLookup(container, match, page)
    }
    container = container.add(']')
    return container
  }

  function typeLookup (container, type, page) {
    var parts = type.split('/')
    parts.forEach(function (part, index) {
      if (part in types) {
        container = container.add(page.create('a').class('qm-api-type-link').attr('href', types[part]).text(part))
      } else {
        container = container.add(part)
      }
      if (index !== parts.length - 1) {
        container = container.add(' / ')
      }
    })
    return container
  }

  // creates a span containing one or more / separated types (complete with links for known types)
  function createType (type, page) {
    if (type === undefined || type === '') {
      return
    }

    var container = page.create('span')
    if (type.indexOf('[') > -1) {
      container = matchBrackets(container, type, page)
    } else {
      container = typeLookup(container, type, page)
    }

    return container
  }

  function createTagClasses (entity) {
    var tags = []

    function maybeTag (name, force) {
      if (entity.has(name) || force) {
        tags.push(name)
      }
    }

    var childUpdated = !entity.has(['added', 'updated', 'removed', 'deprecated']) && entity.has(['added', 'updated', 'removed', 'deprecated'], {recursive: true})

    maybeTag('added')
    maybeTag('deprecated')
    maybeTag('removed')
    maybeTag('updated', childUpdated)

    return tags
  }

  function createTags (entity, page) {
    var tags = page.create('span').class('qm-api-header-tags')

    createTagClasses(entity).forEach(function (name) {
      tags.add(page.create('span').class('qm-api-tag qm-api-tag-' + name).text(name))
    })

    return tags
  }

  // general template for headers (handles the tags automatically, just provide the details span)
  function createHeader (type, details, entity, page, transforms) {
    var tagClasses = createTagClasses(entity).map(function (name) { return 'qm-api-' + name }).join(' ')

    return page.create('div').class('qm-api-item-header qm-api-' + type + '-header')
      .add(details.class('qm-api-header-details ' + tagClasses))
      .add(createTags(entity, page))
  }

  function createNotice (type, title) {
    return function (entity, page, transforms) {
      if (entity.has(type)) {
        var notice = entity.select(type)
        notice.removeAll('issue')

        if (notice.content.length) {
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
    if (a.params[0] < b.params[0]) return -1
    else if (a.params[0] > b.params[0]) return 1
  }

  function organiseEntity (entity) {
    var addedE = []
    var updatedE = []
    var existingE = []
    var deprecatedE = []
    var removedE = []

    entity.content.forEach(function (e) {
      var e = quantum.select(e)
      if (e.has('removed')) {
        removedE.push(e)
      } else if (e.has('deprecated')) {
        deprecatedE.push(e)
      } else if (e.has('updated')) {
        updatedE.push(e)
      } else if (e.has('added')) {
        addedE.push(e)
      } else {
        existingE.push(e)
      }
    })

    addedE = addedE.sort(sortEntities)
    updatedE = updatedE.sort(sortEntities)
    existingE = existingE.sort(sortEntities)
    deprecatedE = deprecatedE.sort(sortEntities)
    removedE = removedE.sort(sortEntities)

    entity.content = addedE.concat(
      updatedE.concat(
        existingE.concat(
          deprecatedE.concat(
            removedE
          )
        )
      )
    )
    return entity
  }

  // creates a group of items (like all the methods on a prototype, or all the properties on an object)
  function createItemGroup (type, title, options) {
    return function (entity, page, transforms) {
      if (entity.has(type)) {
        var entity = entity.filter(type)
        if (!options || !options.noSort) entity = organiseEntity(entity)
        return page.create('div').class('qm-api-' + type + '-group')
          .add(page.create('h2').text(title))
          .add(entity.transform(transforms))
      }
    }
  }

  var whiteChevron = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10" height="14" viewBox="0 0 10 14"><path fill="#FFFFFF" d="M8.648 6.852l-5.797 5.797q-0.148 0.148-0.352 0.148t-0.352-0.148l-1.297-1.297q-0.148-0.148-0.148-0.352t0.148-0.352l4.148-4.148-4.148-4.148q-0.148-0.148-0.148-0.352t0.148-0.352l1.297-1.297q0.148-0.148 0.352-0.148t0.352 0.148l5.797 5.797q0.148 0.148 0.148 0.352t-0.148 0.352z"></path></svg>'
  var blackChevron = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10" height="14" viewBox="0 0 10 14"><path fill="#444444" d="M8.648 6.852l-5.797 5.797q-0.148 0.148-0.352 0.148t-0.352-0.148l-1.297-1.297q-0.148-0.148-0.148-0.352t0.148-0.352l4.148-4.148-4.148-4.148q-0.148-0.148-0.148-0.352t0.148-0.352l1.297-1.297q0.148-0.148 0.352-0.148t0.352 0.148l5.797 5.797q0.148 0.148 0.148 0.352t-0.148 0.352z"></path></svg>'

  // creates a qm collapsible
  function createCollapsible (page, clas, header, content) {
    return page.create('div').class('qm-api-collapsible qm-api-item ' + clas)
      .add(page.create('div').class('qm-api-collapsible-heading')
        .add(page.create('div').class('qm-api-collapsible-toggle').text(whiteChevron, true))
        .add(page.create('div').class('qm-api-collapsible-head')
          .add(header)))
      .add(page.create('div').class('qm-api-collapsible-content')
        .add(content))
  }

  function createItemBuilder (opts) {
    return function (clas) {
      var standard = [deprecated, removed]

      return function (entity, page, transforms) {
        // render as something else if the type parameter matches
        // (eg @property bob [Function] should be rendered as a function)
        var others = opts.renderAsOther || {}
        var otherKeys = Object.keys(others)
        for (var i = 0; i < otherKeys.length; i++) {
          var name = otherKeys[i]
          if (entity.params[1] === name || (entity.params[1] === undefined && entity.params[0] === name)) {
            return others[name](clas)(entity, page, transforms)
          }
        }

        var content = page.create('div').class('qm-api-item-content')

        standard.concat(opts.content).forEach(function (builder) {
          content = content.add(builder(entity, page, transforms))
        })

        if (opts.header) {
          // XXX: do optional check

          var extraHeaderClasses = (entity.type[entity.type.length - 1] === '?') ? ' qm-api-optional' : ''
          var header = page.create('div').class('qm-api-item-head' + extraHeaderClasses)

          opts.header.forEach(function (builder) {
            header = header.add(builder(entity, page, transforms))
          })

          var extraClasses = entity.empty() ? ' qm-api-item-no-description' : ''
          return createCollapsible(page, clas + extraClasses, header, content)
        } else {
          return content
        }
      }
    }
  }

  /* header building blocks */

  // creates a header for function type items
  function functionHeader (entity, page, transforms) {
    var name = page.create('span').class('qm-api-function-name').text(entity.type === 'constructor' ? 'constructor' : entity.params[0])

    var params = entity.selectAll(['param', 'param?']).map(function (paramEntity) {
      var isOptional = paramEntity.type[paramEntity.type.length - 1] === '?'
      return page.create('span').class(isOptional ? 'qm-api-function-param qm-api-optional' : 'qm-api-function-param')
        .add(page.create('span').class('qm-api-function-param-name').text(paramEntity.params[0]))
        .add(page.create('span').class('qm-api-function-param-type').add(createType(paramEntity.params[1], page)))
    })

    var returns = page.create('span').class('qm-api-function-returns').add(createType(entity.select('returns').ps(), page))

    var details = page.create('span')
      .add(name)
      .add(page.create('span').class('qm-api-function-params').add(params))
      .add(returns)

    return createHeader('function', details, entity, page, transforms)
  }

  // creates a header for property type items
  function propertyHeader (entity, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-property-name').text(entity.params[0] || ''))
      .add(page.create('span').class('qm-api-property-type').add(createType(entity.params[1], page)))

    return createHeader('property', details, entity, page, transforms)

  }

  function prototypeHeader (entity, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-prototype-name').text(entity.params[0] || ''))

    var extenddEntities = entity.selectAll('extends')

    if (extenddEntities.length > 0) {
      details = details.add(page.create('span').class('qm-api-prototype-extends').text('extends'))

      extenddEntities.forEach(function (ent) {
        var extender = page.create('span')
          .class('qm-api-prototype-extends-type')
          .add(createType(ent.ps(), page))
        details = details.add(extender)
      })
    }

    return createHeader('prototype', details, entity, page, transforms)

  }

  // creates a header for entity type items
  function entityHeader (entity, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-entity-name').text('@' + entity.params[0] || ''))
      .add(page.create('span').class('qm-api-entity-params').text(entity.select('params').ps()))
      .add(page.create('span').class('qm-api-entity-content').text(entity.select('params').cs()))

    return createHeader('entity', details, entity, page, transforms)

  }

  // creates a header for type items
  function typeHeader (entity, page, transforms) {
    var details = page.create('span')
      .add(page.create('span').class('qm-api-type-name').add(createType(entity.params[0], page)))

    return createHeader('type', details, entity, page, transforms)
  }

  /* content building blocks */

  function description (entity, page, transforms) {
    if (entity.has('description')) {
      return page.create('div').class('qm-api-description').add(entity.select('description').transform(transforms))
    } else {
      return page.create('div').class('qm-api-description').text(entity.cs().trim())
    }
  }

  function extras (entity, page, transforms) {
    return page.create('div').class('qm-api-extras').add(
      Promise.all(entity.selectAll('extra').map(function (e) {
        return page.create('div').class('qm-api-extra')
          .add(e.transform(transforms))
      })))
  }

  function defaultValue (entity, page, transforms) {
    if (entity.has('default')) {
      return page.create('div').class('qm-api-default')
        .add(page.create('span').class('qm-api-default-key').text('Default: '))
        .add(page.create('span').class('qm-api-default-value').add(entity.select('default').ps().trim()))
        .add(entity.select('default').transform(transforms))
    }
  }

  function groups (entity, page, transforms) {
    if (entity.has('group')) {
      var sortedEntity = organiseEntity(entity.filter('group'))
      return page.create('div').class('qm-api-group-container')
        .add(Promise.all(sortedEntity.selectAll('group').map(function (e) {
          return page.create('div').class('qm-api-group')
            .add(page.create('h2').text(e.ps()))
            .add(page.create('div').class('qm-api-group-content')
              .add(e.transform(transforms)))
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
    content: [ description, extras, properties, groups, objects, prototypes, functions, classes, entities ]
  })

  var createGroupLike = createItemBuilder({
    content: [ properties, groups, objects, prototypes, functions, methods, classes, entities ]
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
    content: [ description, extras, defaultValue, constructors, groups, properties, methods, functions ]
  })

  var createEntityLike = createItemBuilder({
    header: [ entityHeader ],
    content: [ description, extras, groups, entities ],
  })

  /* transforms */

  function api (entity, page, transforms) {
    return page.addAssets({
      css: { 'quantum-api.css': __dirname + '/client/quantum-api.css' },
      js: { 'quantum-api.js': __dirname + '/client/quantum-api.js' }
    }).then(function () {
      return createApiLike('qm-api')(entity, page, transforms)
    })
  }

  function example (entity, page, transforms) {
    var body = page.create('div').class('qm-api-example-body')
      .add(entity.transform(transforms))

    var codeBody = page.create('div').class('qm-api-example-code-body')

    function addCodeSection (type, title) {
      if (entity.has(type)) {
        var subEntity = entity.select(type)
        var fake = quantum.select({
          content: [{
            type: 'codeblock',
            params: [type],
            content: subEntity.content
          }]
        })

        codeBody = codeBody
          .add(page.create('div').text(title))
          .add(fake.transform(transforms))
      }
    }

    addCodeSection('html', 'HTML')
    addCodeSection('js', 'JavaScript')
    addCodeSection('coffee', 'CoffeeScript')
    addCodeSection('css', 'CSS')
    addCodeSection('json', 'JSON')

    var code = page.create('div').class('qm-api-example-code qm-api-collapsible')
      .add(page.create('div').class('qm-api-collapsible-heading')
        .text(blackChevron, true)
        .add(page.create('span').text('Code')))
      .add(page.create('div').class('qm-api-collapsible-content')
        .add(page.create('div').class('qm-api-example-code-container')
          .add(codeBody)
      )
    )

    return page.create('div').class('qm-api-example')
      .add(body)
      .add(code)
  }

  return {
    'api': api,
    'group': createGroupLike('qm-api-group'),
    'example': example,
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

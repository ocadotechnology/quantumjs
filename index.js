var quantum = require('quantum-js')
var clone = require('clone')
var path = require('path')
var flatten = require('flatten')
var merge = require('merge')

function getTags (options, ignore) {
  var tags = Object.keys(options.tags)

  if (ignore && ignore.length) {
    return tags.filter(function (e) {
      return ignore.indexOf(e) === -1
    })
  } else {
    return tags
  }
}

function constructKey (parentKey, entity) {
  if (entity.type === 'function' || entity.type === 'method' || entity.type === 'constructor') {
    return parentKey + ':' + entity.type + ':' + entity.ps() + '(' + entity.selectAll(['param', 'param?']).map(function (param) {  return param.ps() }).join(', ') + ')'
  } else {
    return parentKey + ':' + entity.type + ':' + entity.ps()
  }
}

function buildApiMap (apiEntity, options, apiCurrent, parentKey) {
  apiEntity.selectAll(options.taggable.concat(options.indexable || [])).forEach(function (entity) {
    if (options.indexable.indexOf(entity.type) > -1) {
      buildApiMap(entity, options, apiCurrent, parentKey)
    } else {
      var key = constructKey(parentKey, entity)
      apiCurrent[key] = {
        entity: entity,
        parentKey: parentKey
      }
      if (!(entity.has(['removed']))) {
        buildApiMap(entity, options, apiCurrent, key)
      }
    }
  })

  if (parentKey === '') {
    var rootCount = 0
    apiEntity.content.filter(function (i) {return getTags(options).indexOf(i.type) > -1}).forEach(function (entity) {
      apiCurrent['_root:' + apiEntity.ps() + ':' + entity.type + (rootCount += 1)] = {
        entity: entity,
        rootEntity: true
      }
    })
  }
}

function partMap (separator) {
  return function (part, index) {
    var res = []
    if (index > 0) {
      res.push(separator)
    }
    res.push(getPart(part))
    return res
  }
}

function getPart (part) {
  if (part.indexOf(', ') !== -1) {
    return part.split(', ').map(partMap(', '))
  } else if (part.indexOf(' ') !== -1) {
    return part.split(' ')[0]
  } else if (part.indexOf('/') !== -1) {
    return part.split('/').map(partMap('/'))
  } else {
    return part
  }
}

function convertFunction (item, beginSymb, endSymb) {
  var parts = []
  parts.push(convertToParts(item.slice(0, item.indexOf(beginSymb))))
  parts.push(beginSymb)
  parts.push(convertToParts(item.slice(item.indexOf(beginSymb) + 1, item.indexOf(endSymb))))
  parts.push(endSymb)
  return parts
}

function convertToParts (item) {
  if (item.indexOf('(') !== -1) {
    return convertFunction(item, '(', ')')
  } else {
    return [getPart(item)]
  }
}

function splitKey (key, headingSeparator) {
  var heading = ''
  key.split(/\:[^\:]*\:/).filter(function (item) {
    return item && item.length > 0
  }).forEach(function (item, index) {
    if (index > 0) {
      heading = heading + headingSeparator
    }
    if (headingSeparator === ' ') {
      heading = heading + '.' + item
    } else {
      flatten(convertToParts(item)).forEach(function (part) {
        heading = heading + part
      })
    }
  })
  return heading.replace('.(', '(')
}

function createEntry (entity, heading) {
  entity = quantum.select(entity)

  var entry = quantum.create(entity.type)
  if (heading) {
    entry.ps(heading)
  } else if (entity.params && entity.params.length) {
    entry.params = entity.params
  }

  var desc = quantum.create('description')
  desc.content = entity.content.filter(function (e) {return !e.type || (e.type && e.type !== 'issue')  })

  entity.selectAll('issue').forEach(function (i) {
    entry = entry.add(i)
  })
  return entry.add(desc)
}

function createItem (apiName, apiObject, versionName, options) {
  var tags = getTags(options)
  var item = quantum.create('item').ps(apiName)

  for (key in apiObject.apiContent) {
    var apiComponent = apiObject.apiContent[key]

    if (apiComponent.rootEntity) {
      var entity = apiComponent.entity
      if (entity.type !== undefined) {
        item = item.add(createEntry(entity))
      }
    } else {
      quantum.select(apiComponent.entity).selectAll(tags).forEach(function (entity) {
        if (entity.type !== undefined) {
          var headingSeparator = (key.indexOf('class') === 1 ? ' ' : '.')
          item = item.add(createEntry(entity, splitKey(key, headingSeparator)))
        }
      })
    }
  }

  item.content = item.content.sort(function (a, b) {
    if (tags.indexOf(a.type) === -1) {
      return -1
    } else if (tags.indexOf(b.type) === -1) {
      return 1
    } else {
      var order = options.tags[a.type].order - options.tags[b.type].order
      if (order === 0) {
        return (a.params.join(' ').toLowerCase() > b.params.join(' ').toLowerCase() ? 1 : -1)
      } else {
        return order
      }
    }
  })

  if (item.content.length) {
    if (!options.dontAddDocsLink) {
      var docsUrl = options.docsUrlLookup(versionName, apiName)
    }
    if (docsUrl) {
      item = item.add(quantum.create('link').ps(docsUrl.link).add(docsUrl.text))
    }

    if (options.renderSingleItemInRoot) {
      item = item.add(quantum.create('renderSingleItemInRoot'))
    }
  }

  return item.build()
}

function cloneAndRemoveTags (options, version) {
  var versionClone = clone(version, {circular: false})

  for (apiName in versionClone) {
    var apiMap = versionClone[apiName].apiContent
    var apiKeys = Object.keys(apiMap)
    var isRemovedApi = apiKeys.filter(function (e) { return e.indexOf('_root') > -1 && e.indexOf('removed') > -1 }).length > 0
    apiKeys.forEach(function (key) {
      var entity = quantum.select(apiMap[key].entity)
      if (entity.has('removed') || (apiMap[key].rootEntity && entity.type !== 'deprecated') || (isRemovedApi && entity.type === 'deprecated')) {
        delete apiMap[key]
      } else {
        entity.removeAll(getTags(options, ['deprecated', 'removed']))
      }
    })
  }

  return versionClone
}

// processes a single changelog that contains a @process entity. Returns an array of entites
function process (wrapper, options) {
  var versionEntities = wrapper.selectAll('version')
  var versionEntitesMap = {}
  var actualVersions = versionEntities.map(function (versionEntity) {
    versionEntitesMap[versionEntity.ps()] = versionEntity
    return versionEntity.ps()
  })
  var targetVersionList = options.targetVersions || actualVersions

  var processEntities = wrapper.select('process').selectAll('version', {recursive: true})

  options.dontAddDocsLink = wrapper.select('process').has('dontAddDocsLink')
  options.renderSingleItemInRoot = wrapper.select('process').has('renderSingleItemInRoot')

  wrapper.remove('process')

  var apisGroupedByVersion = {}
  processEntities.forEach(function (version) {
    apisGroupedByVersion[version.ps()] = apisGroupedByVersion[version.ps()] || []
    if (version.has('api')) {
      apisGroupedByVersion[version.ps()].push(version.select('api').entityContent())
    }
  })

  // collect the apis up by (version, api) and flatten each of those apis to flat objects
  var previous = undefined
  var flattenedApiMapByVersion = {}
  var current = {}

  actualVersions.forEach(function (versionName) {
    var apis = apisGroupedByVersion[versionName] || []
    current = cloneAndRemoveTags(options, current)

    flattenedApiMapByVersion[versionName] = current

    apis.forEach(function (api) {
      var apiName = api.ps()
      if (!(apiName in current)) {
        current[apiName] = {
          api: api,
          apiContent: {}
        }
      }
      buildApiMap(api, options, current[apiName].apiContent, '')
    })

    if (previous) {
      // handle cases where new content is added or content is updated
      for (apiName in current) {
        if (!(apiName in previous)) {
          current[apiName].api.content.push(quantum.create('added').build())
        } else {
          var currentApiContent = current[apiName].apiContent
          var previousApiContent = previous[apiName].apiContent

          var sortedCurrentApiKeys = Object.keys(currentApiContent).sort()

          var currentParent = undefined

          sortedCurrentApiKeys.forEach(function (key) {
            var currentApiElement = currentApiContent[key]
            var entity = quantum.select(currentApiElement.entity)

            if (!currentApiElement.rootEntity) {
              // check if the api-element has just been removed in the previous version, or if it does not exist
              // in the previous version). In either case, the api-element can be considered to be added (since it
              // did not exist in the previous version of the api)
              if (!(key in previousApiContent) || quantum.select(previousApiContent[key].entity).has('removed')) {
                if (currentParent === undefined || key.indexOf(currentParent) !== 0) {
                  currentParent = key

                  if (!entity.has(['added', 'removed'])) {
                    entity.content.push(quantum.create('added').build())
                  }
                }
              } else {
                var previousApiElement = previousApiContent[key]

                if (!entity.has(getTags(options, ['added']))) {
                  var hasNewDescription = (entity.has('description') && (JSON.stringify(entity.select('description')) !== JSON.stringify(quantum.select(previousApiElement.entity).select('description'))))
                  var hasNewContentString = (entity.nonEmpty().cs() && (entity.nonEmpty().cs() !== quantum.select(previousApiElement.entity).nonEmpty().cs()))
                  if (hasNewDescription || hasNewContentString) {
                    entity.content.push(quantum.create('updated').build())
                  }
                }
              }
            }
          })
        }
      }
    }

    previous = current
  })

  // replace the wrapper content with the calculated changelog
  // using targetVersionList allows us to exclude versions from the output but still process them.
  wrapper.original.content = targetVersionList.map(function (versionName) {
    var changelogEntityBuilder = quantum.create('changelog').ps(versionName)
    var versionEntity = versionEntitesMap[versionName]
    var selectedEntity = quantum.select(versionEntity)

    if (selectedEntity.has('description')) {
      changelogEntityBuilder.add(selectedEntity.select('description'))
    }

    if (selectedEntity.has('link')) {
      changelogEntityBuilder.add(selectedEntity.select('link'))
    }

    if (selectedEntity.has('milestone')) {
      changelogEntityBuilder.add(selectedEntity.select('milestone'))
    }

    if (selectedEntity.has('extra')) {
      changelogEntityBuilder.add(selectedEntity.select('extra'))
    }

    var apiMap = flattenedApiMapByVersion[versionName]
    var newContent = []
    for (apiName in apiMap) {
      if (apiMap[apiName]) {
        var item = createItem(apiName, apiMap[apiName], versionName, options)
      }
      if (item.content.filter(function (e) { return e.type !== 'link'}).length > 0) {
        changelogEntityBuilder.add(item)
      }
    }

    // only add if it contains stuff
    if (changelogEntityBuilder.content.length) return changelogEntityBuilder.build()
    else undefined
  }).filter(function (d) { return d != undefined})

  if (options.reverseVisibleList) {
    wrapper.original.content.reverse()
  }

}

// searches for @changelog entities with @process in them and generates the changelog from the contents of process
function processAll (content, options) {
  var changelogs = quantum.select(content)
    .selectAll(['wrapper', options.namespace + '.' + 'wrapper'], {recursive: true})
    .filter(function (changelog) {
      return changelog.has('process')
    })

  changelogs.forEach(function (changelog) {
    process(changelog, options)
  })

  return content
}

module.exports = function (opts) {
  function defaultDocsUrlLookup (version, api) {
    return {
      link: path.join('/', 'docs', version, api.split(' ').join('-').toLowerCase()),
      text: 'Docs'
    }
  }

  var defaultOptions = {
    namespace: 'changelog',
    targetVersions: undefined, // Target array of versions, used to exclude versions from the list.
    taggable: [ // Elements that can be tagged and should be indexed
      'function',
      'prototype',
      'method',
      'property',
      'object',
      'constructor',
      'returns',
      'event',
      'data',
      'class',
      'extraclass',
      'childclass'
    ],
    indexable: [ // Elements that can't be tagged but should be indexed
      'param',
      'group'
    ],
    reverseVisibleList: false, // Whether the list of items should be shown in the order provided or reversed. Default reversed.
    dontAddDocsLink: false, // Whether docs links should be ignored and the docsUrlLookup should not be run
    renderSingleItemInRoot: false, // Whether changelogs with a single item should render the entries in the root of that changelog
    milestoneUrl: '',
    issueUrl: '',
    docsUrlLookup: defaultDocsUrlLookup, // The lookup for urls from a changelog to a docs page
    tags: {
      added: {
        keyText: 'Added', // The text for the key
        iconClass: 'fa fa-fw fa-plus', // The class for the icon
        order: 8 // The order to display tagged content in
      },
      updated: {
        keyText: 'Updated',
        iconClass: 'fa fa-fw fa-level-up',
        order: 7
      },
      deprecated: {
        keyText: 'Deprecated',
        iconClass: 'fa fa-fw fa-recycle',
        order: 5
      },
      removed: {
        keyText: 'Removed',
        iconClass: 'fa fa-fw fa-times',
        order: 4
      },
      enhancement: {
        keyText: 'Enhancement',
        iconClass: 'fa fa-fw fa-magic',
        order: 6
      },
      bugfix: {
        keyText: 'Bug Fix',
        iconClass: 'fa fa-fw fa-bug',
        order: 3
      },
      docs: {
        keyText: 'Documentation',
        iconClass: 'fa fa-fw fa-book',
        order: 2
      },
      info: {
        keyText: 'Information',
        iconClass: 'fa fa-fw fa-info',
        order: 1
      }
    }
  }

  var options = merge.recursive(defaultOptions, opts)

  var transform = function (obj) {
    return {
      filename: obj.filename,
      content: processAll(obj.content, options)
    }
  }

  transform.transforms = require('./html-transforms')(options)

  return transform

}

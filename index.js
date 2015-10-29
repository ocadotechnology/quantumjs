var quantum = require('quantum-js')
var clone = require('clone')

// function cloneEntity (entity) {
//   var newObj = {
//     type: entity.type,
//     params: entity.params,
//     content: entity.content.slice(0)
//   }
//   if (entity.original) {
//     newObj.original = entity.original
//   }
//   return newObj
// }

// function cloneApiContentChild (child) {
//   return {
//     entity: cloneEntity(child.entity),
//     parentKey: child.parentKey
//   }
// }

// function cloneApiContent (apiContent) {
//   var newObj = {}
//   Object.keys(apiContent).forEach(function (key) {
//     newObj[key] = cloneApiContentChild(apiContent[key])
//   })
//   return newObj
// }

// function cloneVersion (version) {
//   return {
//     api: version.api,
//     apiContent: cloneApiContent(version.apiContent)
//   }
// }

// function quickClone (object) {
//   var newObj = {}
//   Object.keys(object).forEach(function (key) {
//     newObj[key] = cloneVersion(object[key])
//   })
//   return newObj
// }

function constructKey (parentKey, entity) {
  if (entity.type === 'function' || entity.type === 'method' || entity.type === 'constructor') {
    return parentKey + ':' + entity.type + ':' + entity.ps() + '(' + entity.selectAll(['param', 'param?']).map(function (param) {  return param.ps() }).join(', ') + ')'
  } else {
    return parentKey + ':' + entity.type + ':' + entity.ps()
  }
}

function buildApiMap (apiEntity, options, apiCurrent, parentKey) {
  var contents = apiEntity.selectAll(options.types)

  contents.forEach(function (entity) {
    var key = constructKey(parentKey, entity)
    if (options.dontActuallyAddTheseJustKeepLooking.indexOf(entity.type) === -1) {
      apiCurrent[key] = {
        entity: entity,
        parentKey: parentKey
      }
    }
    if (!(entity.has(['removed']))) {
      buildApiMap(entity, options, apiCurrent, key)
    }
  })
}

function createItem (apiName, apiObject, options) {
  var tags = Object.keys(options.tags)
  var item = quantum.create('item').ps(apiName)

  for (key in apiObject.apiContent) {
    var apiComponent = apiObject.apiContent[key].entity
    quantum.select(apiComponent).selectAll(tags).forEach(function (selection) {
      if (selection.type !== undefined) {
        var desc = quantum.create('description')
        desc.content = selection.content.filter(function (e) {return !e.type || (e.type && e.type !== 'issue')  })
        var entry = quantum.create(selection.type).ps(key)
        entry = entry.add(desc)
        selection.selectAll('issue').forEach(function (i) {
          entry = entry.add(i)
        })
        item = item.add(entry.add(desc))
      }
    })
  }

  return item.build()
}

function cloneAndRemoveTags (version) {
  var versionClone = clone(version, {circular: false})
  // var versionClone = quickClone(version)

  for (apiName in versionClone) {
    var apiMap = versionClone[apiName].apiContent

    Object.keys(apiMap).forEach(function (key) {
      var entity = quantum.select(apiMap[key].entity)
      if (entity.has('removed')) {
        delete apiMap[key]
      } else {
        entity.removeAll(['added', 'updated', 'enhancement', 'docs', 'info', 'bugfix'])
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

  var versions = wrapper.select('process').selectAll('version', {recursive: true})

  wrapper.remove('process')

  var apisGroupedByVersion = {}
  versions.forEach(function (version) {
    apisGroupedByVersion[version.ps()] = apisGroupedByVersion[version.ps()] || []
    if (version.has('api')) {
      apisGroupedByVersion[version.ps()].push(version.select('api').entityContent())
    }
  })

  // collect the apis up by (version, api) and flatten each of those apis to flat objects
  var previous = undefined
  var flattenedApiMapByVersion = {}
  var current = {}

  targetVersionList.forEach(function (versionName) {
    var apis = apisGroupedByVersion[versionName] || []
    current = cloneAndRemoveTags(current)

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

          var sortedCurrentApiContent = Object.keys(currentApiContent).sort()

          var currentParent = undefined

          sortedCurrentApiContent.forEach(function (key) {
            var currentApiElement = currentApiContent[key]
            var entity = quantum.select(currentApiElement.entity)

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

              if (!entity.has(['removed', 'deprecated', 'updated', 'info', 'bugfix', 'enhancement', 'docs'])) {
                var hasNewDescription = (entity.has('description') && (JSON.stringify(entity.select('description')) !== JSON.stringify(quantum.select(previousApiElement.entity).select('description'))))
                var hasNewContentString = (entity.nonEmpty().cs() && (entity.nonEmpty().cs() !== quantum.select(previousApiElement.entity).nonEmpty().cs()))
                if (hasNewDescription || hasNewContentString) {
                  entity.content.push(quantum.create('updated').build())
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

  wrapper.original.content = targetVersionList.map(function (versionName) {
    var changelogEntityBuilder = quantum.create('changelog').ps(versionName)
    var versionEntity = versionEntitesMap[versionName]

    // TODO: merge in the description and link from the versionEntity

    var apiMap = flattenedApiMapByVersion[versionName]
    var newContent = []
    for (apiName in apiMap) {
      if (apiMap[apiName])
        var item = createItem(apiName, apiMap[apiName], options)
      if (item.content.length) {
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
  // TODO: sort out these options
  options = {
    namespace: 'changelog',
    reverseVisibleList: true,
    types: [
      'function',
      'prototype',
      'method',
      'property',
      'property?',
      'object',
      'param',
      'param?',
      'constructor',
      'returns',
      'event',
      'data',
      'class',
      'extraclass',
      'childclass'
    ],
    dontActuallyAddTheseJustKeepLooking: [
      'param',
      'param?'
    ],
    tags: {
      added: {
        class: 'hx-positive',
        icon: 'fa-plus',
        title: 'Added',
        order: 1
      },
      updated: {
        class: 'hx-default',
        icon: 'fa-level-up',
        title: 'Updated',
        order: 2
      },
      deprecated: {
        class: 'hx-warning',
        icon: 'fa-recycle',
        title: 'Deprecated',
        order: 3
      },
      removed: {
        class: 'hx-negative',
        icon: 'fa-times',
        title: 'Removed',
        order: 4
      },
      enhancement: {
        class: 'hx-info',
        icon: 'fa-magic',
        title: 'Enhancement',
        order: 5
      },
      bugfix: {
        class: 'hx-warning',
        icon: 'fa-bug',
        title: 'Bug Fix',
        order: 6
      },
      docs: {
        class: 'hx-default',
        icon: 'fa-book',
        title: 'Documentation',
        order: 7
      },
      info: {
        class: 'hx-contrast',
        icon: 'fa-info',
        title: 'Information',
        order: 8
      }
    }
  }

  options.targetVersions = opts.targetVersions
  options.jsTypes = opts.jsTypes
  options.issueUrl = opts.issueUrl

  var transform = function (obj) {
    return {
      filename: obj.filename,
      content: processAll(obj.content, options)
    }
  }

  transform.transforms = require('./html-transforms')(options)

  return transform

}

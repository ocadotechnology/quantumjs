
var quantum = require('quantum-js')

function constructKey(parentKey, entity) {
  if(entity.type === 'function' || entity.type === 'method' || entity.type === 'constructor') {
    return parentKey + ':' + entity.type + ':' + entity.ps() + '(' + entity.selectAll(['param', 'param?']).map(function(param){  return param.ps() }).join(',') + ')'
  } else {
    return parentKey + ':' + entity.type + ':' + entity.ps()
  }
}

function buildApiMap(apiEntity, options, apiCurrent, parentKey) {
  var contents = apiEntity.selectAll(options.types)

  contents.forEach(function(entity){
    var key = constructKey(parentKey, entity)
    apiCurrent[key] = entity
    if (!(entity.has(['removed']))) {
      buildApiMap(entity, options, apiCurrent, key)
    }
  })
}

function createItem(apiName, apiObject, options) {
  var tags = Object.keys(options.tags)

  var item = quantum.create('item').ps(apiName)

  for (key in apiObject.apiContent) {
    var apiComponent = apiObject.apiContent[key]
    quantum.select(apiComponent).selectAll(tags).forEach(function(selection) {
      if (selection.type !== undefined) {
        item.add(quantum.create(selection.type).ps(key))
      }
    })
  }

  return item.build()
}

// processes a single changelog that contains a @process entity. Returns an array of entites
function process(wrapper, options) {

  var targetVersions = wrapper.selectAll('version')
  var targetVersionList = targetVersions.map(function(version) {
    return version.ps()
  })

  var versions = wrapper.select('process').selectAll('version', {recursive: true})

  wrapper.remove('process')

  var apisGroupedByVersion = {}
  versions.forEach(function(version) {
    apisGroupedByVersion[version.ps()] = apisGroupedByVersion[version.ps()] || []
    if (version.has('api')) {
      apisGroupedByVersion[version.ps()].push(version.select('api').entityContent())
    }
  })


  // collect the apis up by (version, api) and flatten each of those apis to flat objects
  var previous = undefined
  var flattenedApiMapByVersion = {}
  targetVersionList.forEach(function(versionName) {
    var apis = apisGroupedByVersion[versionName] || []
    var current = {}
    flattenedApiMapByVersion[versionName] = current

    apis.forEach(function(api) {
      var apiName = api.ps()
      var apiCurrent = {
        api: api,
        apiContent: {}
      }
      current[apiName] = apiCurrent
      buildApiMap(api, options, apiCurrent.apiContent, '')
    })

    if (previous) {

      // handle cases where new content is added or content is updated
      for (apiName in current) {
        if (!(apiName in previous)) {
          current[apiName].api.content.push(quantum.create('added').build())
        } else {
          var currentApiContent = current[apiName].apiContent
          var previousApiContent = previous[apiName].apiContent

          for (key in currentApiContent) {
            var entity = quantum.select(currentApiContent[key])
            if(!(key in previousApiContent)) {
              entity.content.push(quantum.create('added').build())
            } else {
              if(!entity.has(['removed', 'deprecated', 'updated', 'info', 'bugfix', 'enhancement', 'docs'])) {
                var hasNewDescription = (entity.has('description') && (JSON.stringify(entity.select('description')) !== JSON.stringify(quantum.select(previousApiContent[key]).select('description'))))
                var hasNewContentString = (entity.nonEmpty().cs() && (entity.nonEmpty().cs() !== quantum.select(previousApiContent[key]).nonEmpty().cs()))
                if (hasNewDescription || hasNewContentString) {
                  entity.content.push(quantum.create('updated').build())
                }
              }
            }
          }
        }
      }
    }

    previous = current
  })

  targetVersions.forEach(function(versionEntity) {
    var version = versionEntity.original
    version.type = 'changelog'
    var versionName = versionEntity.ps()

    var apiMap = flattenedApiMapByVersion[versionName]
    var newContent = []
    for (apiName in apiMap) {
      if (apiMap[apiName])
      var item = createItem(apiName, apiMap[apiName], options)
      if(item.content.length) {
        newContent.push(item)
      }
    }

    version.content = newContent
  })



}

// searches for @changelog entities with @process in them and generates the changelog from the contents of process
function processAll(content, options) {

  var changelogs = quantum.select(content)
    .selectAll(['wrapper', options.namespace + '.' + 'wrapper'], {recursive: true})
    .filter(function(changelog) {
      return changelog.has('process')
    })

  changelogs.forEach(function(changelog) {
    process(changelog, options)

  })

  return content
}

module.exports = function(options) {

  options = {
    namespace: 'changelog',
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

  var transform = function(obj) {
    return {
      filename: obj.filename,
      content: processAll(obj.content, options)
    }
  }

  transform.transforms = require('./html-transforms')(options)

  return transform

}

'use strict'
const quantum = require('quantum-js')
const clone = require('clone')
const flatten = require('flatten')
const merge = require('merge')
const path = require('path')

function getTags (options, ignore) {
  const tags = Object.keys(options.tags)
  if (ignore && ignore.length) {
    return tags.filter((e) => ignore.indexOf(e) === -1)
  } else {
    return tags
  }
}

function constructKey (parentKey, entity) {
  if (entity.type === 'function' || entity.type === 'method' || entity.type === 'constructor') {
    return parentKey + ':' + entity.type + ':' + entity.ps() + '(' + entity.selectAll(['param', 'param?']).map((param) => param.ps()).join(', ') + ')'
  } else {
    return parentKey + ':' + entity.type + ':' + entity.ps()
  }
}

function buildApiMap (apiEntity, options, apiCurrent, parentKey) {
  const tags = options.taggable.concat(options.indexable || [])
  const optionalTags = tags.map((tag) => tag + '?')
  apiEntity.selectAll(tags.concat(optionalTags)).forEach((entity) => {
    if (options.indexable.indexOf(entity.type.replace('?', '')) > -1) {
      buildApiMap(entity, options, apiCurrent, parentKey)
    } else {
      const key = constructKey(parentKey, entity)
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
    let rootCount = 0
    apiEntity.content.filter((i) => {
      return getTags(options).indexOf(i.type) > -1
    })
      .forEach((entity) => {
        apiCurrent['_root:' + apiEntity.ps() + ':' + entity.type + (rootCount += 1)] = {
          entity: entity,
          rootEntity: true
        }
      })
  }
}

function partMap (separator) {
  return (part, index) => {
    const res = []
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
  const parts = []
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
  let heading = ''
  key.split(/:[^:]*:/).filter((item) => {
    return item && item.length > 0
  }).forEach((item, index) => {
    if (index > 0) {
      heading = heading + headingSeparator
    }
    if (headingSeparator === ' ') {
      heading = heading + '.' + item
    } else {
      flatten(convertToParts(item)).forEach((part) => {
        heading = heading + part
      })
    }
  })
  return heading.replace('.(', '(')
}

function createEntry (entity, heading) {
  let entry = quantum.create(entity.type)
  if (heading) {
    entry.ps(heading)
  } else if (entity.params && entity.params.length) {
    entry.params = entity.params
  }

  const desc = quantum.create('description')
  desc.content = entity.content.filter((e) => !e.type || (e.type && e.type !== 'issue'))

  quantum.select(entity).selectAll('issue').forEach((i) => {
    entry = entry.add(i)
  })
  return entry.add(desc)
}

function createItem (apiName, apiObject, versionName, options) {
  const tags = getTags(options)
  let item = quantum.create('item').ps(apiName)

  for (const key in apiObject.apiContent) {
    const apiComponent = apiObject.apiContent[key]

    if (apiComponent.rootEntity) {
      const entity = apiComponent.entity
      if (entity.type !== undefined) {
        item = item.add(createEntry(entity))
      }
    } else {
      quantum.select(apiComponent.entity).selectAll(tags).forEach((entity) => {
        if (entity.type !== undefined) {
          const headingSeparator = (key.indexOf('class') === 1 ? ' ' : '.')
          item = item.add(createEntry(entity, splitKey(key, headingSeparator)))
        }
      })
    }
  }

  item.content = item.content.sort((a, b) => {
    if (tags.indexOf(a.type) === -1) {
      return -1
    } else if (tags.indexOf(b.type) === -1) {
      return 1
    } else {
      const order = options.tags[a.type].order - options.tags[b.type].order
      if (order === 0) {
        return (a.params.join(' ').toLowerCase() > b.params.join(' ').toLowerCase() ? 1 : -1)
      } else {
        return order
      }
    }
  })

  if (item.content.length) {
    if (!options.dontAddDocsLink) {
      const docsUrl = options.docsUrlLookup(versionName, apiName)
      if (docsUrl) {
        item = item.add(quantum.create('link').ps(docsUrl.link).add(docsUrl.text))
      }
    }

    if (options.renderSingleItemInRoot) {
      item = item.add(quantum.create('renderSingleItemInRoot'))
    }
  }

  return item.build()
}

function cloneAndRemoveTags (options, version) {
  const versionClone = clone(version, {circular: false})

  for (const apiName in versionClone) {
    const apiMap = versionClone[apiName].apiContent
    const apiKeys = Object.keys(apiMap)
    const isRemovedApi = apiKeys.filter((e) => e.indexOf('_root') > -1 && e.indexOf('removed') > -1).length > 0
    apiKeys.forEach((key) => {
      const entity = quantum.select(apiMap[key].entity)
      if (entity.has('removed') || (apiMap[key].rootEntity && entity.type !== 'deprecated') || (isRemovedApi && entity.type === 'deprecated')) {
        delete apiMap[key]
      } else {
        entity.removeAll(getTags(options, ['deprecated', 'removed']))
      }
    })
  }

  return versionClone
}

// processes a single changelog that contains a @process entity. Returns an array of entities
function process (wrapper, options) {
  const versionEntities = wrapper.selectAll('version')
  const versionEntitesMap = {}
  const actualVersions = versionEntities.map((versionEntity) => {
    versionEntitesMap[versionEntity.ps()] = versionEntity
    return versionEntity.ps()
  })
  const targetVersionList = options.targetVersions || actualVersions

  const processEntities = wrapper.select('process').selectAll('version', {recursive: true})

  options.dontAddDocsLink = wrapper.select('process').has('dontAddDocsLink')
  options.renderSingleItemInRoot = wrapper.select('process').has('renderSingleItemInRoot')

  wrapper.remove('process')

  const apisGroupedByVersion = {}
  processEntities.forEach((version) => {
    apisGroupedByVersion[version.ps()] = apisGroupedByVersion[version.ps()] || []
    if (version.has('api')) {
      apisGroupedByVersion[version.ps()].push(version.select('api').entityContent())
    }
  })

  // collect the apis up by (version, api) and flatten each of those apis to flat objects
  let previous = undefined
  const flattenedApiMapByVersion = {}
  let current = {}

  actualVersions.forEach((versionName) => {
    const apis = apisGroupedByVersion[versionName] || []
    current = cloneAndRemoveTags(options, current)

    flattenedApiMapByVersion[versionName] = current

    apis.forEach((api) => {
      const apiName = api.ps()
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
      for (const apiName in current) {
        if (!(apiName in previous)) {
          current[apiName].api.content.push(quantum.create('added').build())
        } else {
          const currentApiContent = current[apiName].apiContent
          const previousApiContent = previous[apiName].apiContent

          const sortedCurrentApiKeys = Object.keys(currentApiContent).sort()

          let currentParent = undefined

          sortedCurrentApiKeys.forEach((key) => {
            const currentApiElement = currentApiContent[key]
            const entity = quantum.select(currentApiElement.entity)

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
                const previousApiElement = previousApiContent[key]

                if (!entity.has(getTags(options, ['added']))) {
                  const hasNewDescription = (entity.has('description') && (JSON.stringify(entity.select('description')) !== JSON.stringify(quantum.select(previousApiElement.entity).select('description'))))
                  const hasNewContentString = (entity.nonEmpty().cs() && (entity.nonEmpty().cs() !== quantum.select(previousApiElement.entity).nonEmpty().cs()))
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
  wrapper.original.content = targetVersionList.map((versionName) => {
    const changelogEntityBuilder = quantum.create('changelog').ps(versionName)
    const versionEntity = versionEntitesMap[versionName]
    const selectedEntity = quantum.select(versionEntity)

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

    const apiMap = flattenedApiMapByVersion[versionName]
    for (const apiName in apiMap) {
      const item = createItem(apiName, apiMap[apiName], versionName, options)
      if (item.content.filter((e) => e.type !== 'link').length > 0) {
        changelogEntityBuilder.add(item)
      }
    }

    // only add if it contains stuff
    if (changelogEntityBuilder.content.length) {
      return changelogEntityBuilder.build()
    } else {
      undefined
    }
  }).filter((d) => d !== undefined)

  if (options.reverseVisibleList) {
    wrapper.original.content.reverse()
  }
}

// searches for @changelog entities with @process in them and generates the changelog from the contents of process
function processAll (content, options) {
  const changelogs = quantum.select(content)
    .selectAll(['wrapper', options.namespace + '.' + 'wrapper'], {recursive: true})
    .filter((changelog) => changelog.has('process'))

  changelogs.forEach((changelog) => process(changelog, options))

  return content
}

function pipeline (opts) {
  const options = merge.recursive(require('./config.js'), opts)
  return (page) => page.clone({ content: processAll(page.content, options) })
}

module.exports = pipeline
module.exports.transforms = require('./transforms')
module.exports.assets = {
  'quantum-changelog.css': path.join(__dirname, '../assets/quantum-changelog.css'),
  'quantum-changelog.js': path.join(__dirname, '../assets/quantum-changelog.js')
}

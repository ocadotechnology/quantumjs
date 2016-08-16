/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Version
  =======

  Merges content from different @version entities together.

*/

var quantum = require('quantum-js') // needed for its selection api
var path = require('path') // required for the default filename renamer
var merge = require('merge')
var chalk = require('chalk')
var Page = quantum.Page

function getEntityType (type) {
  return type ? type.replace('?', '') : undefined
}

// NOTE: this function may mutate content1 - pass in a cloned copy if you don't want to mutate the original
function mergeContent (content1, content2, options) {
  // it isn't possible to merge text - so we just return the new content, and
  // ignore the previous content if that is the case
  if (content2.some(function (e) { return typeof (e) === 'string' && e !== '' })) {
    return content2
  } else { // otherwise, we perform the per entity merging
    var c1Map = {}

    content1.forEach(function (e1) {
      var matchLookup = options.entityMatchLookup(e1)
      if (matchLookup) {
        c1Map[matchLookup] = e1
      }
    })

    content2.forEach(function (e2) {
      var matchLookup = options.entityMatchLookup(e2)
      var e1 = matchLookup ? c1Map[matchLookup] : undefined

      var entityType = getEntityType(e2.type)
      var isTaggable = (options.taggable.indexOf(entityType) > -1)

      if (!!e1) {
        var e1s = quantum.select(e1)
        if (e1.content && e2.content) {
          if (options.unmergeable.indexOf(entityType) > -1) {
            e1s.content(e2.content)
          } else {
            e1s.content(mergeContent(e1.content, e2.content, options))
          }

          var e1sCanBeUpdated = !e1s.has('removed') && !e1s.has('deprecated')
          var e2sCanBeUpdated = quantum.select.isEntity(e2) && !quantum.select(e2).has('removed') && !quantum.select(e2).has('deprecated')

          if (isTaggable && e1sCanBeUpdated && e2sCanBeUpdated) {
            e1.content.push({ type: 'updated', params: [], content: [] })
          } else if (e1s.has('removed') && e1s.has('deprecated')) {
            e1s.remove('deprecated')
          }
        }
      } else {
        if (isTaggable) {
          e2.content.push({ type: 'added', params: [], content: [] })
        } else if (options.indexable.indexOf(entityType) > -1) {
          e2.content.forEach(function (e) {
            var subIsTaggable = options.taggable.indexOf(getEntityType(e.type)) > -1
            if (e && subIsTaggable) {
              e.content.push({ type: 'added', params: [], content: [] })
            }
          })
        }
        content1.push(e2)
      }
    })

    return content1
  }
}

function getRemovableTags (tags) {
  return Object.keys(tags).filter(function (tag) {
    return !tags[tag].retain
  })
}

// filters versions for added, updated and removed flags
// added, updated: removes flags from item, leaves item in content
// removed: removes item from content
function removeTags (entity, tags) {
  if (Array.isArray(entity.content)) {
    function tagFilter (e) {
      var entityIsRemoved = quantum.select.isEntity(e) && quantum.select(e).has('removed')
      var removeTag = tags.indexOf(e.type) > -1
      return !entityIsRemoved && !removeTag
    }
    entity.content = entity.content.filter(tagFilter)
    entity.content.forEach(function (e) {removeTags(e, tags)})
  }
  return entity
}

// adds the versions to the @versionList entity. mutates the input
function populateVersionList (entity, versions, currentVersion) {
  if (entity.type === 'versionList') {
    entity.content.push({type: 'current', params: [currentVersion], content: []})
    versions.forEach(function (v) {
      entity.content.push({type: 'version', params: [v], content: []})
    })
  } else if (Array.isArray(entity.content)) {
    entity.content.forEach(function (e) {
      populateVersionList(e, versions, currentVersion)
    })
  }
}

// de-version the source (remove all @version entities)
// this removes the @version entities recursively
function removeVersions (entity) {
  if (Array.isArray(entity.content) && entity.type !== 'versionList') {
    entity.content = entity.content.filter(function (e) { return e.type !== 'version' })
    entity.content.forEach(removeVersions)
  }
}

function defaultEntityMatchLookup (entity) {
  if (quantum.select.isEntity(entity)) {
    var selection = quantum.select(entity)
    var name = selection.ps()
    var params = selection.selectAll(['param', 'param?']).map(function (param) {return param.ps()})
    return entity.type + ': ' + name + '(' + params.join(', ') + ')'
  } else {
    return undefined
  }
}

function defaultFilenameModifier (file, version) {
  if (file.dest.endsWith('index.um')) {
    return file.clone({
      dest: file.dest.replace('index.um', version) + '/' + 'index.um'
    })
  } else {
    return file.clone({
      dest: file.dest.replace('.um', '') + '/' + version + '.um'
    })
  }
}

function versionTransform (page, options) {
  var content = quantum.select(page.content)
  var fullVersionList = options.versions || []

  if (content.has('versionList', {recursive: true})) {
    var inputList = content.selectAll('versionList', {recursive: true}).filter(function (versionList) {
      return versionList.selectAll('version').length > 0
    })[0]

    if (inputList) {
      var inputVersionList = inputList.selectAll('version').map(function (v) {
        return v.ps()
      })
      if (inputVersionList.length > 0) {
        fullVersionList = inputVersionList
      }

      // remove the list of versions - they will be repopulated by the populateVersionList function
      inputList.content([])
    }
  }

  var targetVersions = options.targetVersions || fullVersionList
  var actualVersions = content.selectAll('version', {recursive: true})

  // Check if there are actual versions in the object, if there arent then no versioning is required.
  if (actualVersions.length > 0) {
    if (fullVersionList.length === 0) {
      page.warning({
        module: 'quantum-version',
        problem: 'No versions available for quantum-version to use: options.versions is not defined and no @versionsList was found in this file',
        resolution: 'Either define a @versionList or pass in options.versions to quantum-version'
      })
    }

    var versionsMap = {}
    actualVersions.forEach(function (version) {
      versionsMap[version.ps()] = version
    })
    var base = undefined
    var results = []

    var removableTags = getRemovableTags(options.tags)

    fullVersionList.forEach(function (v) {
      var version = versionsMap[v]

      if (version !== undefined) {
        if (base === undefined) {
          base = {content: version.content()}
        } else {
          base = {content: mergeContent(removeTags(quantum.clone(base), removableTags).content, version.content(), options)}
        }
      } else {
        base = removeTags(quantum.clone(base), removableTags)
      }

      // replace the versioned parts for the @version entities
      var source = quantum.clone(content.entity()) // {content: }

      // insert the versioned content just before the first version entity
      // this searches recursively until it finds the right one
      function insertVersionedContent (entity) {
        if (Array.isArray(entity.content)) {
          var index = -1
          entity.content.forEach(function (v, i) {
            if (v.type === 'version' && v.params && v.params[0] === actualVersions[0].param(0)) {
              index = i
            }
          })

          if (index > -1) {
            // this bit actually inserts the content
            entity.content.splice.apply(entity.content, [index, 0].concat(base.content))
          } else {
            entity.content.forEach(insertVersionedContent)
          }
        }
      }

      if (base !== undefined) {
        insertVersionedContent(source)
      }

      populateVersionList(source, fullVersionList, v)
      removeVersions(source)

      // XXX [OPTIMISATION]: this can be done with fewer clones when versions are missing from the targetVersions list
      // build the new result with new filename and add the result to the results list
      if (targetVersions.indexOf(v) > -1) {
        results.push(page.clone({
          file: options.filenameModifier(page.file, v),
          content: source,
          meta: {
            version: v
          }
        }))

        // optionally output the latest version without the filename modification
        if (options.outputLatest && v === fullVersionList[fullVersionList.length - 1]) {
          results.push(page.clone({
            content: quantum.clone(source),
            meta: {
              version: v
            }
          }))
        }
      }

    })

    return results
  } else {
    // return an array for consistent return type - without this
    // the user would have to check if the return type is an array
    // which wouldn't be nice to use
    return [page]
  }
}

// returns a function that expands a quantum ast containing `version`
// entities into multiple ast's - one for each version
module.exports = function (opts) {
  var options = merge.recursive({
    versions: undefined,
    targetVersions: undefined, // Target array of versions
    entityMatchLookup: defaultEntityMatchLookup,
    filenameModifier: defaultFilenameModifier,
    outputLatest: true,
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
      'childclass',
      'entity'
    ],
    indexable: [ // Elements that can't be tagged but should be indexed
      'param',
      'group'
    ],
    unmergeable: [], // Elements that can not be merged (e.g. descriptions)
    tags: {
      added: {
        retain: false, // Whether to retain the tag across versions
        removeEntity: false // Whether to remove the tagged entity in the next version
      },
      updated: {
        retain: false,
        removeEntity: false
      },
      deprecated: {
        retain: true,
        removeEntity: false
      },
      removed: {
        retain: false,
        removeEntity: true
      }
    }
  }, opts)

  return function (page) {
    return versionTransform(page, options)
  }
}

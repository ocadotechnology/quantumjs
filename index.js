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

// NOTE: this function may mutate content1 - pass in a cloned copy if you don't want to mutate the original
function mergeContent (content1, content2, options) {
  // it isn't possible to reliably merge text - so we just return the new content, and
  // ignore the previous content if that is the case
  if (content2.some(function (e) { return typeof (e) === 'string' && e !== '' })) {
    return content2
  } else { // otherwise, we perform the per entity merging
    var c1Map = {}

    content1.forEach(function (e1) {
      c1Map[options.entityMatchLookup(e1)] = e1
    })

    content2.forEach(function (e2) {
      var e1 = c1Map[options.entityMatchLookup(e2)]
      var e1s = quantum.select(e1)
      var e2s = quantum.select(e2)

      if (!!e1) {
        if (e1.content && e2.content) {
          if (options.unmergable.indexOf(e2.type) > -1) {
            e1s.replaceContent(e2.content)
          } else {
            e1s.replaceContent(mergeContent(e1.content, e2.content, options))
          }

          var e1sCanBeUpdated = !e1s.has('removed') && !e1s.has('deprecated')
          var e2sCanBeUpdated = !e2s.has('removed') && !e2s.has('deprecated')

          if ((options.taggable.indexOf(e2.type) > -1) && e1sCanBeUpdated && e2sCanBeUpdated) {
            e1.content.push({ type: 'updated', params: [], content: [] })
          } else if (e1s.has('removed') && e1s.has('deprecated')) {
            e1s.remove('deprecated')
          }
        }
      } else {
        if (options.taggable.indexOf(e2.type) > -1) {
          e2.content.push({ type: 'added', params: [], content: [] })
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
      var entityIsRemoved = quantum.select(e).has('removed')
      var removeTag = tags.indexOf(e.type) > -1
      return !entityIsRemoved && !removeTag
    }
    entity.content = entity.content.filter(tagFilter)
    entity.content.forEach(function (e) {removeTags(e, tags)})
  }
  return entity
}

// returns a function that expands a quantum ast containing `version` entities into
// potentially multiple ast's - one for each version
module.exports = function (opts) {
  function defaultEntityMatchLookup (entity) {
    entity = quantum.select(entity)
    var name = entity.ps()
    var params = entity.selectAll(['param', 'param?']).map(function (param) {return param.ps()})
    return entity.type + ': ' + name + '(' + params.join(', ') + ')'
  }

  function defaultFilenameModifier (filename, version) {
    return path.join(path.dirname(filename), version, path.basename(filename))
  }

  var defaultOptions = {
    versions: undefined,
    targetVersions: undefined, // Target array of versions
    entityMatchLookup: defaultEntityMatchLookup,
    filenameModifier: defaultFilenameModifier,
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
  }

  var options = merge.recursive(defaultOptions, opts)

  options.targetVersions = options.targetVersions || options.versions

  return function (obj) {
    // generate the versioned parts
    var content = quantum.select(obj.content)
    var actualVersions = content.selectAll('version', {recursive: true})

    if (actualVersions.length > 0) {
      var versionsMap = {}
      actualVersions.forEach(function (version) {
        versionsMap[version.ps()] = version
      })
      var base = undefined
      var results = []

      var removableTags = getRemovableTags(options.tags)

      options.versions.forEach(function (v) {
        var version = versionsMap[v]

        if (version !== undefined) {
          if (base === undefined) {
            base = {content: version.content}
          } else {
            base = {content: mergeContent(removeTags(quantum.select(base).clone(), removableTags).content, version.content, options)}
          }
        } else {
          base = removeTags(quantum.select(base).clone(), removableTags)
        }

        // replace the versioned parts for the @version entites
        var source = {content: content.clone().content}

        // insert the versioned content just before the first version entity
        // this searches recursively until it finds the right one
        function insertVersionedContent (entity) {
          if (Array.isArray(entity.content)) {
            var index = -1
            entity.content.forEach(function (v, i) {
              if (v.type === 'version' && v.params && v.params[0] === actualVersions[0].params[0]) {
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

        // de-version the source (remove all @version entities)
        // this removes the @version entites recursively
        function removeVersions (entity) {
          if (Array.isArray(entity.content)) {
            entity.content = entity.content.filter(function (e) { return e.type !== 'version' })
            entity.content.forEach(removeVersions)
          }
        }
        removeVersions(source)

        // build the new result with new filename and add the result to the results list
        if (options.targetVersions.indexOf(v) > -1) {
          results.push({
            filename: options.filenameModifier(obj.filename, v),
            content: source,
            version: v
          })
        }

      })

      return results
    } else {
      return obj
    }

  }
}

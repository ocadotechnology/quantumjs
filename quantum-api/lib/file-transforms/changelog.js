'use strict'

const quantum = require('quantum-js')
const qversion = require('quantum-version')
const utils = require('../utils')
const tags = require('../tags')

/*
  fileTransform
  -------------

  Checks if there is a @changelogList section that needs populating in a page.
  If there is it processes the changelogList entry, which invloves going through
  all the api sections found in the @process section of the @changelogList and
  extracting changelog entries.

  If no @changelogList is found, this function does nothing to the page
*/
function fileTransform (page, options) {
  const changelogLists = quantum.select(page.content)
    .selectAll('changelogList', {recursive: true})

  if (changelogLists.length > 0) {
    changelogLists.forEach(changelogList => {
      processChangelogList(page, changelogList, options)
    })
    return page.clone({ content: page.content })
  } else {
    return page
  }
}

/*
  processChangelogList
  --------------------

  Processes all the @api entries found in the @process subentity of the
  @changelogList that is passed in. It uses the found @apis to generate changelog
  entries.
*/
function processChangelogList (page, changelogList, options) {
  const groupByApi = changelogList.has('groupByApi') ? changelogList.select('groupByApi').ps() === 'true' : options.changelogGroupByApi
  const reverseVisibleList = changelogList.has('reverseVisibleList') ? changelogList.select('reverseVisibleList').ps() === 'true' : options.changelogReverseVisibleList
  const entityTypeToLanguage = {}
  options.languages.forEach(language => {
    Object.keys(language.changelogHeaderTransforms).forEach(entityType => {
      entityTypeToLanguage[entityType] = language
    })
  })

  const changelogs = buildChangelogs(changelogList, entityTypeToLanguage, groupByApi)

  if (reverseVisibleList) {
    changelogs.reverse()
  }

  changelogList.content(changelogs)
}

/*
  buildChangelogs
  ---------------

  Creates the @changelog sections by finding tags and grouping by version and api
*/
function buildChangelogs (changelogList, entityTypeToLanguage, groupByApi) {
  const processSelection = changelogList.select('process')
  const tagSelections = processSelection.selectAll(tags, {recursive: true})

  // Select the versions and build a map for fast lookup
  const versionSelections = changelogList.selectAll('version')
  const versionSelectionsByVersion = {}
  versionSelections.forEach(versionSelection => {
    versionSelectionsByVersion[versionSelection.ps()] = versionSelection
  })

  const versions = Object.keys(versionSelectionsByVersion).sort(utils.semanticVersionComparator)

  // Group the tags by version
  const tagSelectionsByVersion = {}
  versions.forEach(version => {
    tagSelectionsByVersion[version] = []
  })
  tagSelections.forEach(t => {
    const version = t.ps()
    tagSelectionsByVersion[version] = tagSelectionsByVersion[version] || []
    tagSelectionsByVersion[version].push(t)
  })

  // Copy any deprecated tags across to the next version until a removed tag is reached
  versions.forEach((version, i) => {
    if (i + 1 < versions.length) {
      const nextVersion = versions[i + 1]
      tagSelectionsByVersion[version]
        .filter(tag => tag.type() === 'deprecated')
        .forEach(tag => {
          if (tag.parent().has('removed') && tag.parent().select('removed').ps() !== nextVersion) {
            tagSelectionsByVersion[nextVersion].push(tag)
          }
        })
    }
  })

  // Create the changelogs for each version and add the descriptions from the changelogList
  return versions.map(version => {
    const changelog = buildChangelog(version, versions, tagSelectionsByVersion[version], entityTypeToLanguage, groupByApi)
    const versionSelection = versionSelectionsByVersion[version]
    if (versionSelection && versionSelection.has('description')) {
      changelog.content.unshift(versionSelection.select('description').entity())
    }
    return changelog
  })
}

function buildChangelog (version, versions, tagSelections, entityTypeToLanguage, groupByApi) {
  return {
    type: 'changelog',
    params: [version],
    content: groupByApi ? buildGroups(version, versions, tagSelections, entityTypeToLanguage) : buildEntries(version, versions, tagSelections, entityTypeToLanguage)
  }
}

function buildGroups (version, versions, tagSelections, entityTypeToLanguage) {
  // Group the tags by api
  const tagsByApi = new Map()
  tagSelections.forEach(tag => {
    const parentApi = tag.selectUpwards('api')
    if (parentApi) {
      const parentApiName = parentApi.ps()
      tagsByApi.set(parentApiName, tagsByApi.get(parentApiName) || [])
      tagsByApi.get(parentApiName).push(tag)
    }
  })

  return Array.from(tagsByApi.entries()).map(([apiName, tags]) => {
    return {
      type: 'group',
      params: [apiName],
      content: buildEntries(version, versions, tagSelections, entityTypeToLanguage)
    }
  })
}

function buildEntries (version, versions, tagSelections, entityTypeToLanguage) {
  // Group the tags by the parent
  const tagsByParent = new Map()
  tagSelections.forEach(tag => {
    const parent = tag.parent()
    tagsByParent.set(parent, tagsByParent.get(parent) || [])
    tagsByParent.get(parent).push(tag)
  })

  const res = []
  Array.from(tagsByParent.entries()).forEach(([parent, tagSelections]) => {
    if (parent.type() === 'api') {
      tagSelections.forEach(tag => {
        const content = tag.content()
        if (!tag.has('description') && parent.has('description') && tag.type() === 'added') {
          content.push(quantum.clone(parent.select('description').entity()))
        }
        res.push({
          type: 'change',
          params: [tag.type()],
          content: content
        })
      })
    } else {
      const language = entityTypeToLanguage[parent.type()]

      // Select all the way up to the api and build a narrow view of the api that
      // just includes this entry. Filter out @groups along the way
      let selection = parent

      const sanitizedParent = quantum.select(quantum.clone(parent.entity()))
      qversion.processVersioned(sanitizedParent.entity(), version, versions)
      sanitizedParent.removeAllChildOfType(tags)

      let entity = undefined
      while (selection.parent() && selection.type() !== 'api') {
        if (selection.type() === 'group') {
          selection = selection.parent()
        } else {
          // If we hit something that is not supported by the language, then quit
          if (entityTypeToLanguage[selection.type()] !== language) {
            return
          }
          entity = {
            type: selection.type(),
            params: selection.params().slice(),
            content: entity ? [entity] : sanitizedParent.content()
          }
          selection = selection.parent()
        }
      }

      // console.log(entity.type, language)
      if (language) {
        const header = {
          type: 'header',
          params: [language.name],
          content: [entity]
        }

        res.push({
          type: 'entry',
          params: [],
          content: [header].concat(tagSelections.map(tag => {
            const content = tag.content()
            if (!tag.has('description') && parent.has('description') && tag.type() === 'added') {
              content.push(quantum.clone(parent.select('description').entity()))
            }
            return {
              type: 'change',
              params: [tag.type()],
              content: content
            }
          }))
        })
      }
    }
  })

  return res
}

module.exports = {
  fileTransform,
  processChangelogList,
  buildChangelogs,
  buildChangelog,
  buildGroups,
  buildEntries
}

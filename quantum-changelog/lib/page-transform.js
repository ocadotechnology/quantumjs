'use strict'

const quantum = require('quantum-js')

const config = require('./config.js')
const utils = require('./utils')

const tags = ['removed', 'deprecated', 'enhancement', 'bugfix', 'updated', 'added', 'info']

/*
  pageTransform
  -------------

  Checks if there is a @changelogList section that needs populating in a page.
  If there is it processes the changelogList entry, which invloves going through
  all the api sections found in the @process section of the @changelogList and
  extracting changelog entries.

  If no @changelogList is found, this function does nothing to the page
*/
function pageTransform (page, options) {
  const resolvedOptions = config.resolve(options)

  const root = quantum.select(page.content)

  if (root.has('changelogList', {recursive: true})) {
    processChangelogList(page, root.select('changelogList', {recursive: true}), resolvedOptions)
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
  const groupByApi = changelogList.has('groupByApi') ? changelogList.select('groupByApi').ps() === 'true' : options.groupByApi
  const reverseVisibleList = changelogList.has('reverseVisibleList') ? changelogList.select('reverseVisibleList').ps() === 'true' : options.reverseVisibleList
  const languages = options.languages
  const targetVersions = options.targetVersions

  const processSelection = changelogList.select('process')

  const foundVersions = changelogList.selectAll('version').map(v => v.ps())

  // pull out the api entries from the content
  const { apisByVersion } = extractApis(processSelection)
  const targetVersionList = targetVersions || foundVersions

  // collect the descriptions
  const descriptionsByVersion = new Map()
  changelogList.selectAll('version').forEach(versionSelection => {
    if (versionSelection.has('description')) {
      descriptionsByVersion.set(versionSelection.ps(), versionSelection.select('description'))
    }
  })

  // build the api maps and changelog entries
  const changelogMapsByVersion = buildAllChangelogEntries(languages, targetVersionList, apisByVersion)

  // convert the changelog entries into ast
  const changelogAST = targetVersionList.map(version => {
    const changelogEntriesByApi = changelogMapsByVersion.get(version)
    const description = descriptionsByVersion.get(version)
    return buildChangelogAST(page, version, changelogEntriesByApi, groupByApi, description)
  })

  if (reverseVisibleList) {
    changelogAST.reverse()
  }

  // replace the wrapper's content with the built changelog
  changelogList.content(changelogAST)
}

/*
  extractApis
  -----------

  This extracts the versions and the api entities from the selection passed in.
  When used, this funcion is passed the entire page, and is the first step in
  the changelog building process - it pulls out versions and apis for further
  processing. This function is also responsible for sorting api versions so that
  the changelog is built in the correct order.

  This function returns an object of the form {versions, apisByVersion}. versions
  is the list of versions (sorted), and apisByVersion is a Map which contains
  the apis keyed by version. This Map has been built in order, so can be iterated
  over without any extra sorting needed.
*/
function extractApis (selection) {
  // find all the version tags within the document
  const versionSelections = selection.selectAll('version', { recursive: true })

  // group the apis by version (for faster lookup when processing)
  const unorderedApisGroupedByVersion = new Map()
  versionSelections.forEach(versionSelection => {
    const currentGroup = unorderedApisGroupedByVersion.get(versionSelection.ps()) || []
    unorderedApisGroupedByVersion.set(versionSelection.ps(), currentGroup)
    if (versionSelection.has('api')) {
      currentGroup.push(versionSelection.select('api'))
    }
  })

  // sort the versions into order
  const unorderedVersions = new Set()
  versionSelections.forEach(versionSelection => {
    unorderedVersions.add(versionSelection.ps())
  })
  const versions = Array.from(unorderedVersions.keys())
  versions.sort(utils.semanticVersionComparator)

  // build the api map in order (so it can be iterated over)
  const apisByVersion = new Map()
  versions.forEach(version => {
    apisByVersion.set(version, unorderedApisGroupedByVersion.get(version))
  })

  return {versions, apisByVersion}
}

/*
  buildChangelogEntries
  =====================

  This builds up an apiMap and a list of chagelogEntries

  What is an api map?
  -------------------

  An api map is a collection of all the entries in an api (e.g. @function, @property,
  @method etc). The api map is a flat map, so nested api entries are keyed using
  the combination of their own key, and their parent's key. This means that a property
  on an object such as this:

    @object bob
      @property jane

  would be keyed as follows:

    object:bob.property:jane

  The actual key format depends on how the language defines it's hashing function,
  but the above is the general idea.

  The api map's values are also language dependent - they are objects that contain
  information extracted from the api entries which is used later for generating
  changelog entries.

  What does this function do?
  ---------------------------

  This function builds an api map for a single version. It does this by taking the
  api map from the previous version and applying the diffs found for the current api.
  Whilst working out the new api map, the changes are collected into a list of
  changelog entries.

  The api map itself is not used for anything - but it is needed to to work out
  what has changed from one version to the next and to keep track of how the whole
  api evolves from one version to the next. Once we finish processing the apis we
  can actually throw away the api maps and just keep the changelog entries for
  the next phase of processing.

  These changelog entries are used later to build the changelog ast - but this
  function just extracts the entries for one api and for one version change.
  A full changelog can consist of multiple apis and multiple versions so this
  function is run many times to build the whole changelog.

  This function returns an object of the form {apiMap, changelogEntries}. The
  apiMap is the new api map that has been built. The api map is a Map, with keys
  that are hashes of the api entries, and values which are the api entries .

  The changelogEntries is an array of objects that represent changelog entries
  for the language - the information in these objects is specific to the language
  as the language is responsible for turning the entry into a piece of virtual dom
  down the line.
*/
function buildChangelogEntries (languages, api, previousApiMap, detectAdded) {
  const apiMap = new Map(previousApiMap)
  const changelogEntriesMap = new Map()

  const toplevelEntries = api.selectAll(tags).map(tagSelection => {
    return {
      tagType: tagSelection.type(),
      selection: tagSelection
    }
  })

  if (toplevelEntries.length > 0) {
    changelogEntriesMap.set('__toplevel__', {
      apiEntry: undefined,
      language: undefined,
      changelogEntries: toplevelEntries
    })
  }

  languages.forEach(language => {
    api.selectAll(language.entityTypes, { recursive: true }).forEach(selection => {
      const key = language.hashEntry(selection, api)
      if (key) {
        const changelogEntries = []
        const previousEntry = previousApiMap ? previousApiMap.get(key) : undefined

        const { apiEntry, changes: languageChanges } = language.extractEntry(selection, previousEntry)
        apiMap.set(key, apiEntry)

        languageChanges.forEach(change => {
          changelogEntries.push(change)
        })

        let added = false
        selection.selectAll(tags).map(tagSelection => {
          if (tagSelection.type() === 'added') {
            added = true
          }
          changelogEntries.push({
            tagType: tagSelection.type(),
            selection: tagSelection
          })
        })

        if (!added && previousEntry === undefined && detectAdded) {
          changelogEntries.push({
            tagType: 'added',
            selection: quantum.select({
              type: 'added',
              params: [],
              content: []
            })
          })
        }

        if (changelogEntries.length > 0) {
          changelogEntriesMap.set(key, {
            apiEntry: apiEntry,
            language: language,
            changelogEntries: changelogEntries
          })
        }
      }
    })
  })

  return {
    apiMap: apiMap,
    changelogEntriesMap: changelogEntriesMap
  }
}

/* Builds the api maps for all versions supplied */
function buildAllChangelogEntries (languages, versions, apisByVersion) {
  // it should return a Map which goes from version -> (another) map
  // the values should be Maps which go from api-name -> Map[key -> Array[ChangelogEntry]]
  // As it goes, it should build up api maps for the entire api

  const previousApiMapByApi = new Map()
  const previousChangelogEntriesMapByApi = new Map()
  const changelogMapByVersion = new Map()

  versions.forEach((version, i) => {
    // XXX: do this properly / config?
    const detectAdded = i > 0

    const apis = apisByVersion.get(version)
    const changelogEntriesMapByApi = new Map()
    changelogMapByVersion.set(version, changelogEntriesMapByApi)

    if (apis) {
      apis.forEach(api => {
        const previousApiMap = previousApiMapByApi.get(api.ps())

        const { apiMap, changelogEntriesMap } = buildChangelogEntries(languages, api, previousApiMap, detectAdded)

        previousApiMapByApi.set(api.ps(), apiMap)
        previousChangelogEntriesMapByApi.set(api.ps(), changelogEntriesMap)
        changelogEntriesMapByApi.set(api.ps(), changelogEntriesMap)
      })
    }
  })

  return carryAcrossDeprecations(changelogMapByVersion)
}

function carryAcrossDeprecations (changelogMapByVersion) {
  const deprecationsMapByApi = new Map()

  changelogMapByVersion.forEach((changelogEntriesMapByApi, version) => {
    changelogEntriesMapByApi.forEach((changelogEntriesMap, apiName) => {
      const deprecationsMap = deprecationsMapByApi.get(apiName) || new Map()
      deprecationsMapByApi.set(apiName, deprecationsMap)
      changelogEntriesMap.forEach((apiEntryChanges, key) => {
        apiEntryChanges.changelogEntries.forEach(changelogEntry => {
          if (changelogEntry.tagType === 'deprecated') {
            deprecationsMap.set(key, {
              apiEntryChanges: apiEntryChanges,
              changelogEntry: changelogEntry
            })
          }

          if (changelogEntry.tagType === 'removed') {
            deprecationsMap.delete(key)
          }
        })
      })
    })

    deprecationsMapByApi.forEach((deprecationsMap, apiName) => {
      if (changelogEntriesMapByApi.has(apiName)) {
        const changelogEntriesMap = changelogEntriesMapByApi.get(apiName)
        deprecationsMap.forEach((deprecation, key) => {
          const apiEntryChanges = changelogEntriesMap.get(key)
          if (apiEntryChanges && !apiEntryChanges.changelogEntries.some(changelogEntry => changelogEntry.tagType === 'deprecated')) {
            apiEntryChanges.changelogEntries.push(deprecation.changelogEntry)
          }
        })
      } else {
        const changelogEntriesMap = new Map()
        changelogEntriesMapByApi.set(apiName, changelogEntriesMap)
        deprecationsMap.forEach((deprecation, key) => {
          changelogEntriesMap.set(key, {
            apiEntry: deprecation.apiEntryChanges.apiEntry,
            language: deprecation.apiEntryChanges.language,
            changelogEntries: [deprecation.changelogEntry]
          })
        })
      }
    })
  })

  return changelogMapByVersion
}

function extractChangeContent (change) {
  if (change.selection.has('description')) {
    return change.selection.filter(['description', 'issue']).content()
  } else if (change.selection.cs().length > 0) {
    // page.warning({
    //   module: 'quantum-changelog',
    //   problem: '@' + change.tagType + ' entity found with description content, but no description section was found',
    //   resolution: 'use a @description block'
    // })
    // XXX: remove and reenable the warning above once hexagon has been converted over to the new format
    const content = change.selection.filter('issue').content()

    content.push({
      type: 'description',
      params: [],
      content: change.selection.filter(d => d.type !== 'issue').content()
    })

    change.selection.filter('issue').content()

    return content
  } else {
    return []
  }
}

function buildChangelogAST (page, version, changelogEntriesByApi, groupByApi, description) {
  const content = []

  if (description) {
    content.push(description.entity())
  }

  changelogEntriesByApi.forEach((changelogEntriesMap, apiName) => {
    const targetContent = groupByApi ? [] : content

    changelogEntriesMap.forEach((apiEntryChanges, key) => {
      // handle the api entry changes
      if (apiEntryChanges.language) {
        const entryAst = {
          type: 'entry',
          params: [],
          content: [
            apiEntryChanges.language.buildEntryHeaderAst(apiEntryChanges)
          ]
        }

        apiEntryChanges.changelogEntries.forEach(change => {
          entryAst.content.push({
            type: 'change',
            params: [change.tagType],
            content: extractChangeContent(change)
          })
        })

        targetContent.push(entryAst)
      } else {
        // handle the top level changes
        apiEntryChanges.changelogEntries.forEach(change => {
          targetContent.push({
            type: 'change',
            params: [change.tagType],
            content: extractChangeContent(change)
          })
        })
      }
    })

    if (groupByApi && targetContent.length > 0) {
      content.push({
        type: 'group',
        params: [apiName],
        content: targetContent
      })
    }
  })

  return {
    type: 'changelog',
    params: [version],
    content: content
  }
}

module.exports = {
  pageTransform: pageTransform,
  process: process,
  processChangelogList: processChangelogList,
  extractApis: extractApis,
  buildChangelogEntries: buildChangelogEntries,
  buildAllChangelogEntries: buildAllChangelogEntries,
  buildChangelogAST: buildChangelogAST
}

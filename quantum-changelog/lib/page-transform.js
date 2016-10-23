'use strict'

const quantum = require('quantum-js')
const utils = require('./utils')

const timesink = require('timesink')

// XXX: this should come from config
const javascript = require('./languages/javascript')
const css = require('./languages/css')

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
  const resolvedOptions = resolveOptions(options)

  const root = quantum.select(page.content)

  if (root.has('changelogList', {recursive: true})) {
    processChangelogList(page, root.select('changelogList', {recursive: true}), resolvedOptions)
    console.log(timesink.report())
    return page.clone({ content: page.content })
  } else {
    return page
  }
}

/*
  Resolves the options passed in to make sure every option is set to something
  sensible.
*/
function resolveOptions (options) {
  return {
    targetVersions: options ? options.targetVersions || [] : [],
    languages: options ? options.languages || [] : [],
    reverseVisibleList: options ? options.reverseVisibleList === true : false,
    groupByApi: options ? options.groupByApi === true : false
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
  const groupByApi = options.groupByApi // XXX: make this an option / entity flag
  const reverseVisibleList = options.reverseVisibleList // XXX: make this an option / entity flag

  const stop = timesink.start('process')
  const processSelection = changelogList.select('process')
  const changelogListVersions = changelogList.selectAll('version')

  // pull out the api entries from the content
  const {versions: foundVersions, apisByVersion} = extractApis(processSelection, reverseVisibleList)
  const targetVersionList = options.targetVersions || foundVersions

  // build the api maps and changelog entries
  const {apiMaps, changelogEntries} = buildApiMaps(options.languages, groupByApi, targetVersionList, apisByVersion)

  // convert the changelog entries into ast
  if (groupByApi) {
    // const changelogAST = apiMaps.map(({version, apiMaps}) => {
    //   return buildChangelog(page, version, apiMaps)
    // })
    //
    // // replace the wrapper's content with the built changelog
    // changelogList.content(changelogAST)
  } else {
    // XXX: handle the non grouped case
  }

  stop()
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
function extractApis (selection, reverseVisibleList) {
  const stop = timesink.start('extractApis')

  const stopselect = timesink.start('extractApis-select')
  // find all the version tags within the document
  const versionSelections = selection.selectAll('version', { recursive: true })
  stopselect()

  // find all the version tags, and create a map from version -> entity for faster lookup
  const unorderedVersionSelectionsMap = new Map()
  versionSelections.forEach((versionEntity) => {
    unorderedVersionSelectionsMap.set(versionEntity.ps(), versionEntity)
  })

  // group the apis by version (for faster lookup when processing)
  const unorderedApisGroupedByVersion = new Map()
  versionSelections.forEach((version) => {
    const currentGroup = unorderedApisGroupedByVersion.get(version.ps()) || []
    unorderedApisGroupedByVersion.set(version.ps(), currentGroup)
    if (version.has('api')) {
      currentGroup.push(version.select('api'))
    }
  })

  // sort the versions into order
  const versions = Array.from(unorderedVersionSelectionsMap.keys())
  versions.sort(utils.semanticVersionComparator)

  if (reverseVisibleList) {
    versions.reverse()
  }

  // build the api map in order (so it can be iterated over)
  const apisByVersion = new Map()
  versions.forEach(version => {
    apisByVersion.set(version, unorderedApisGroupedByVersion.get(version))
  })

  stop()
  return {versions, apisByVersion}
}

/*
  buildApiMap
  ===========

  What is an api map?
  -------------------

  An api map is a collection of the entries in an api (e.g. @function, @property,
  @method etc). The api map is a flat map, so nested api entries are keyed using
  the combination of thier own key, and thier parent's key. This means that a property
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

  This function builds an api map for a single version (using the previous api
  map and the changes made in the new version). Whilst working out the new api
  map, the changes are collected into a list of changelog entries.

  The api map itself is not used for anything - but it is needed to to work out
  what has changed from one version to the next. Once we finish processing the
  apis we can actually throw away the api maps and just keep the changelog entries
  for the next phase of processing.

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
function buildApiMap (languages, api, previousApiMap) {
  const stop = timesink.start('buildApiMap')
  const apiMap = new Map(previousApiMap)
  const changelogEntries = []

  languages.forEach(language => {
    // XXX: handle top level changelog entries for the api

    api.selectAll(language.entityTypes, { recursive: true }).forEach(selection => {
      const key = language.hashEntry(selection, api)
      const entry = language.extractEntry(selection)
      apiMap.set(key, entry)

      const previousEntry = previousApiMap ? previousApiMap.get(key) : undefined

      buildDefaultChangelogEntries(previousEntry, entry, selection)
        .forEach(changelogEntry => {
          changelogEntries.push({
            language: language.name,
            entry: changelogEntry
          })
        })

      language.buildChangelogEntries(previousEntry, entry, selection)
        .forEach(changelogEntry => {
          changelogEntries.push({
            language: language.name,
            entry: changelogEntry
          })
        })
    })
  })

  stop()
  return {
    apiMap: apiMap,
    changelogEntries: changelogEntries
  }
}

/* Builds the api maps for all versions supplied */
function buildApiMaps (languages, groupByApi, versions, apisByVersion) {
  const changelogApiMaps = []
  versions.forEach((version, i) => {
    const isFirstVersion = i === 0
    console.log(version)
    const previous = changelogApiMaps[changelogApiMaps.length - 1]
    const apis = apisByVersion.get(version)

    // XXX: apis may be undefined - handle this case by going back to the previous defined version

    if (groupByApi) {
      const apiMaps = new Map()
      apis.forEach(api => {
        const previousApiMap = previous ? previous.apiMaps.get(api.ps()) : undefined
        apiMaps.set(api.ps(), buildApiMap(languages, api, previousApiMap, isFirstVersion))
      })
      changelogApiMaps.push({version, apiMaps})
    } else {
      const apiMap = new Map()
      apis.forEach(api => {
        const changes = buildApiMap(api, previous ? previous.apiMap : undefined, isFirstVersion)
        changes.forEach((v, k) => apiMap.set(k, v))
      })
      changelogApiMaps.push({version, apiMap})
    }
  })

  return changelogApiMaps
}

function buildDefaultChangelogEntries (previousEntry, entry, selection, detectAdded) {
  const changelogEntries = []

  if (previousEntry === undefined && detectAdded) {
    changelogEntries.push({
      tagType: 'added',
      entry: entry
    })
  }

  // early return when the entry was previously removed
  if (previousEntry && previousEntry.tagType === 'removed') {
    return changelogEntries
  }

  // handle removed and deprecated tags
  if (selection.has('removed')) {
    changelogEntries.push({
      tagType: 'removed',
      entry: entry
    })
  } else if (selection.has('deprecated')) {
    changelogEntries.push({
      tagType: 'deprecated',
      entry: entry
    })
  } else if (previousEntry && previousEntry.tagType === 'deprecated') {
    changelogEntries.push(previousEntry)
  }

  if (selection.has('enhancement')) {
    changelogEntries.push({
      tagType: 'enhancement',
      entry: entry
    })
  }

  if (selection.has('bugfix')) {
    changelogEntries.push({
      tagType: 'bugfix',
      entry: entry
    })
  }

  if (selection.has('updated')) {
    changelogEntries.push({
      tagType: 'updated',
      entry: entry
    })
  }

  if (selection.has('added')) {
    changelogEntries.push({
      tagType: 'added',
      entry: entry
    })
  }

  return changelogEntries
}

function buildChangelogAST (page, version, data) {
  const stop = timesink.start('buildChangelog')

  const content = []

  // XXX: get this from the wrapperVersions
  content.push({ type: 'description', params: [], content: [] })

  // XXX: get from config
  const languagesByName = {
    javascript: javascript,
    css: css
  }

  data.forEach((entries, key) => {
    const groupContent = []
    entries.forEach((entry) => {

      const header = languagesByName[entry.language].buildHeaderASTForEntry(entry)

      const entryContent = [header]

      if (entry.selection.has(entry.tagType)) {
        if (entry.selection.select(entry.tagType).has('description')) {
          entryContent.push(entry.selection.select(entry.tagType).select('description').entity())
        } else if (entry.selection.cs().length > 0) {
          // page.warning({
          //   module: 'quantum-changelog',
          //   problem: '@' + entry.tagType + ' entity found with description content, but no description section was found',
          //   resolution: 'use a @description block'
          // })
        }
      }

      groupContent.push({ type: entry.tagType, params: [], content: entryContent })
    })

    if (groupContent.length > 0) {
      content.push({
        type: 'group',
        params: [key],
        content: groupContent
      })
    }
  })

  stop()
  return {
    type: 'changelog',
    params: [version],
    content: content
  }
}

module.exports = {
  pageTransform: pageTransform,
  resolveOptions: resolveOptions,
  process: process,
  extractApis: extractApis,
  buildApiMap: buildApiMap,
  buildApiMaps: buildApiMaps,
  buildDefaultChangelogEntries: buildDefaultChangelogEntries,
  buildChangelogAST: buildChangelogAST
}

'use strict'

const quantum = require('quantum-js')
const utils = require('./utils')

const timesink = require('timesink')

// XXX: this should come from config
const javascript = require('./languages/javascript')
const css = require('./languages/css')

/* This extracts the versions and api sections from the selection passed in */
function extractApis (selection, reverseVisibleList) {
  const stop = timesink.start('extractApis')
  const stopselect = timesink.start('extractApis-select')
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

  const versions = Array.from(unorderedVersionSelectionsMap.keys())
  // XXX: support reverse ordering
  versions.sort(utils.semanticVersionComparator)

  if (reverseVisibleList) {
    versions.reverse()
  }

  const apisGroupedByVersion = new Map()
  versions.forEach(version => {
    apisGroupedByVersion.set(version, unorderedApisGroupedByVersion.get(version))
  })

  stop()
  return {versions, apisGroupedByVersion}
}

function changelogEntryForChange (selection, previousEntry, isFirstVersion, language) {
  /*
    General rules:
    1. All entity types: check for manual tags (updated, removed, deprecated, enhancement, bugfix)
    2. If an entry previously had the removed tag, then remove it from this api map (return undefined)
    3. If an entry previously had deprecated tag, add it to this version also (until it is removed)
  */
  if (previousEntry === undefined && !isFirstVersion) {
    return {
      tagType: 'added',
      language: language.name,
      selection: selection
    }
  } else {
    // General purpose explicit tag related checks
    if (previousEntry && previousEntry.tagType === 'removed') {
      return undefined
    } else if (selection.has('removed')) {
      return {
        tagType: 'removed',
        language: language.name,
        selection: selection
      }
    } else if (selection.has('deprecated')) {
      return {
        tagType: 'deprecated',
        language: language.name,
        selection: selection
      }
    } else if (previousEntry && previousEntry.tagType === 'deprecated') {
      return previousEntry
    } else if (selection.has('enhancement')) {
      return {
        tagType: 'enhancement',
        language: language.name,
        selection: selection
      }
    } else if (selection.has('bugfix')) {
      return {
        tagType: 'bugfix',
        language: language.name,
        selection: selection
      }
    } else if (selection.has('updated')) {
      return {
        tagType: 'updated',
        language: language.name,
        selection: selection
      }
    } else if (selection.has('added')) {
      return {
        tagType: 'added',
        language: language.name,
        selection: selection
      }
    } else {
      // if none of the above rules were matched, check if there are any language
      // specific checks to be done
      return language.changelogEntryForChange(selection, previousEntry, isFirstVersion)
    }
  }
}

/* Builds an api map for a single version (works out the changelog diff of the two versions) */
function buildApiMap (api, previousApiMap, isFirstVersion) {
  // XXX: make use of the previousApiMap
  const stop = timesink.start('buildApiMap')
  const apiMap = new Map(previousApiMap)

  // XXX: get the languages from the options
  const languages = [javascript, css]

  languages.forEach(language => {
    api.selectAll(language.entityTypes, { recursive: true }).forEach(selection => {
      const key = language.hashEntry(selection, api)
      if (key) {
        const previousEntry = previousApiMap ? previousApiMap.get(key) : undefined
        const newEntry = changelogEntryForChange(selection, previousEntry, isFirstVersion, language)
        if (newEntry) {
          apiMap.set(key, newEntry)
        }
      }
    })
  })

  stop()
  return apiMap
}

/* Builds the api maps for all versions supplied */
function buildChangelogApiMaps (groupByApi, actualVersions, apisGroupedByVersion) {
  const changelogApiMaps = []
  actualVersions.forEach((version, i) => {
    const isFirstVersion = i === 0
    console.log(version) // XXX: remove
    const previous = changelogApiMaps[changelogApiMaps.length - 1]
    const apis = apisGroupedByVersion.get(version)

    if (groupByApi) {
      const apiMaps = new Map()
      apis.forEach(api => {
        const previousApiMap = previous ? previous.apiMaps.get(api.ps()) : undefined
        apiMaps.set(api.ps(), buildApiMap(api, previousApiMap, isFirstVersion))
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

function buildChangelog (page, version, data) {
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

      groupContent.push({ type: entry.tagType, params: [], content: entryContent})
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

function process (page, wrapper, options) {
  const groupByApi = true // XXX: make this an option / entity flag
  const reverseVisibleList = true // XXX: make this an option / entity flag

  const stop = timesink.start('process')
  const processSelection = wrapper.select('process')
  const wrapperVersions = wrapper.selectAll('version')

  // pull out the api entries from the content
  const {versions: actualVersions, apisGroupedByVersion} = extractApis(processSelection, reverseVisibleList)
  const targetVersionList = options.targetVersions || actualVersions

  // Next we are going to build an 'api map' for each (version, api) pair.
  // An api map (for a single api) takes the form:
  //     key: String -> { tagType, language, selection }
  //
  // The key is some hash of the api entry (for example, the hash for functions
  // takes the combination the function name and the arguments). The hash also
  // includes the hashes of the parents - so every entry in this map corresponds
  // to a separate piece of the api. Each api map is a flat hashmap.
  //
  // We make one of these maps for each (version, api) pair. And the result
  // is stored in changelogApiMaps. To look up a single api entry from this
  // map, you would use
  //    changelogApiMaps['<version-index>'].get('<api-name>').get('<hash>')
  //
  // When the groupByApi value is false, the middle level of this map structure
  // is not built, so the lookup would become
  //    changelogApiMaps['<version-index>'].get('<hash>')
  const changelogApiMaps = buildChangelogApiMaps(groupByApi, actualVersions, apisGroupedByVersion)

  if (groupByApi) {
    const changelogAST = changelogApiMaps.map(({version, apiMaps}) => {
      return buildChangelog(page, version, apiMaps)
    })

    // replace the wrapper's content with the built changelog
    wrapper.content(changelogAST)
  } else {
    // XXX: handle the non grouped case
  }

  stop()
}

function pageTransform (page, options) {
  const root = quantum.select({
    type: '',
    params: [],
    content: page.content.content
  })

  const wrapper = root.has(options.namespace + '.wrapper', {recursive: true}) ?
    root.select(options.namespace + '.wrapper', {recursive: true}) :
    root.has('wrapper', {recursive: true}) ?
      root.select('wrapper', {recursive: true}) :
      undefined

  if (wrapper) {
    process(page, wrapper, options)
    console.log(timesink.report())
    return page.clone({ content: page.content })
  } else {
    return page
  }
}

module.exports = {
  pageTransform: pageTransform,
  extractApis: extractApis,
  process: process
}

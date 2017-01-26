'use strict'
/*

  Version
  =======

  Provides entities for managing versioned content

*/

const quantum = require('quantum-js')

/* A factory that returns the file transform */
function fileTransform (options) {
  const resolvedOptions = resolveOptions(options)
  return (file) => versionTransform(file, resolvedOptions)
}

/* Resolves an options object, filling in missing options with defaults */
function resolveOptions (options) {
  const {
    versions = undefined, // the versions to build - leave undefined to use the versions from @versionedPage
    filenameModifier = defaultFilenameModifier,
    outputLatest = true
  } = options || {}

  return { versions, filenameModifier, outputLatest }
}

/* The default function used to rename files as they pass through the version transform */
function defaultFilenameModifier (fileInfo, version) {
  if (fileInfo.dest.endsWith('index.um')) {
    return fileInfo.clone({
      dest: fileInfo.dest.replace('index.um', version) + '/' + 'index.um'
    })
  } else {
    return fileInfo.clone({
      dest: fileInfo.dest.replace('.um', '') + '/' + version + '.um'
    })
  }
}

/* Resolves a file with @versioned content into multiple files */
function versionTransform (file, options) {
  const rootSelection = quantum.select(file.content)

  // Is it a versioned file? Early return if not
  if (!rootSelection.has('versionedPage', {recursive: true})) {
    return [file]
  }

  // Resolve the complete version list
  const versions = rootSelection.select('versionedPage', {recursive: true})
    .selectAll('version')
    .map(s => s.ps())

  // Resolve the list of versions to build
  const targetVersions = options.versions || versions

  // Clone the file for each targetVersion, and do the version processing for each cloned file
  const outputFiles = targetVersions.map(version => {
    const clonedFile = file.clone({
      info: options.filenameModifier(file.info, version),
      content: quantum.clone(file.content),
      meta: {
        version: version
      }
    })
    return processFile(clonedFile, version, versions, targetVersions)
  })

  // Optionally output the latest version without the filename modification
  if (options.outputLatest) {
    const lastVersionedFile = outputFiles[outputFiles.length - 1]
    outputFiles.push(file.clone({
      content: quantum.clone(lastVersionedFile.content),
      meta: {
        version: lastVersionedFile.meta.version
      }
    }))
  }

  return outputFiles
}

/* Does the content manipulation for the page to resolve all versioned content */
function processFile (file, version, versions, targetVersions) {
  processTags(file.content, version, versions, file)
  processVersioned(file.content, version, versions)
  processVersionLists(file.content, version, targetVersions)
  return file
}

function versionABeforeVersionB (versionA, versionB, versions) {
  // There is no need to check for -1 here as we have already filtered out
  // versions that are not in the versions list when we use this function
  return versions.indexOf(versionA) < versions.indexOf(versionB)
}

/* Processes all @added, @updated, @deprecated and @removed tags for a file */
function processTags (content, version, versions, file) {
  const tags = quantum.select(content)
    .selectAll(['added', 'updated', 'deprecated', 'removed'], {recursive: true})
    .filter(tag => {
      const tagHasKnownVersion = versions.indexOf(tag.ps()) > -1

      if (!tagHasKnownVersion) {
        file.warning({
          module: 'quantum-version',
          problem: 'Unexpected version "' + tag.ps() + '" found in @' + tag.type(),
          resolution: 'Correct the versions list, or the tag version. The versions list for this page is [' + versions.join(', ') + ']'
        })
        tag.remove()
      }

      return tagHasKnownVersion
    })

  tags.filter(t => t.type() === 'added').forEach(addedTag => {
    // If the content has not yet been added, remove it
    if (versionABeforeVersionB(version, addedTag.ps(), versions)) {
      addedTag.parent().remove()
    } else if (addedTag.ps() !== version) {
      // If the content was added in a previous version, remove the added tag
      addedTag.remove()
    }
  })

  tags.filter(t => t.type() === 'updated').forEach(updatedTag => {
    if (updatedTag.ps() !== version) {
      updatedTag.remove()
    }
  })

  tags.filter(t => t.type() === 'deprecated').forEach(deprecatedTag => {
    if (versionABeforeVersionB(version, deprecatedTag.ps(), versions)) {
      deprecatedTag.remove()
    }
  })

  tags.filter(t => t.type() === 'removed').forEach(removedTag => {
    // if the content was removed in a previous version, remove it
    if (versionABeforeVersionB(removedTag.ps(), version, versions)) {
      removedTag.parent().remove()
    } else if (removedTag.ps() === version) {
      // If it was removed in this version, remove any deprecated tag
      removedTag.parent().removeChildOfType('deprecated')
    } else {
      // Otherwise, the content has not been removed yet, so just remove the
      // 'removed' tag. It is not yet its time.
      removedTag.remove()
    }
  })
}

function mostRecentVersion (version, candidateVersionSelections, versions) {
  let candidateIndex = -1
  const l = versions.length
  for (let i = 0; i < l; i++) {
    if (candidateIndex < candidateVersionSelections.length - 1 && candidateVersionSelections[candidateIndex + 1].ps() === versions[i]) {
      candidateIndex++
    }
    if (version === versions[i]) {
      return candidateIndex > -1 ? candidateVersionSelections[candidateIndex] : undefined
    }
  }
}

/* Processes all @versioned sections for a file */
function processVersioned (content, version, versions) {
  quantum.select(content)
    .selectAll('versioned', {recursive: true})
    .forEach(versioned => {
      const candidateVersionSelections = versioned.selectAll('version')
      const currentVersion = mostRecentVersion(version, candidateVersionSelections, versions)
      if (currentVersion) {
        versioned.addAfter(currentVersion.content())
      }
      versioned.remove()
    })
}

/* Populates all @versionList entities with @version and @current tags for a page */
function processVersionLists (content, version, versions) {
  quantum.select(content)
    .selectAll('versionList', {recursive: true})
    .forEach(versionList => {
      versionList.content(versions.map(v => {
        return { type: 'version', params: [v], content: [] }
      }))
      versionList.add({ type: 'current', params: [version], content: [] })
    })
}

module.exports = {
  resolveOptions,
  defaultFilenameModifier,
  fileTransform,
  mostRecentVersion,
  processTags,
  processVersioned,
  processVersionLists
}

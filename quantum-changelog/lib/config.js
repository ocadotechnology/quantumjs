'use strict'

function defaultIssueUrl () {
  return undefined
}

const defaultOptions = {
  targetVersions: undefined,
  languages: [],
  reverseVisibleList: false,
  groupByApi: false,
  issueUrl: defaultIssueUrl
}

function resolveOption (options, name) {
  return options && options.hasOwnProperty(name) ? options[name] : defaultOptions[name]
}

/*
  Resolves the options passed in to make sure every option is set to something
  sensible.
*/
function resolve (options) {
  return {
    targetVersions: resolveOption(options, 'targetVersions'),
    languages: resolveOption(options, 'languages'),
    reverseVisibleList: resolveOption(options, 'reverseVisibleList'),
    groupByApi: resolveOption(options, 'groupByApi'),
    issueUrl: resolveOption(options, 'issueUrl'),
    tags: {
      info: {
        displayName: 'Information',
        iconClass: 'quantum-changelog-icon-info'
      },
      bugfix: {
        displayName: 'Bug Fix',
        iconClass: 'quantum-changelog-icon-bug-fix'
      },
      removed: {
        displayName: 'Removed',
        iconClass: 'quantum-changelog-icon-removed'
      },
      deprecated: {
        displayName: 'Deprecated',
        iconClass: 'quantum-changelog-icon-deprecated'
      },
      enhancement: {
        displayName: 'Enhancement',
        iconClass: 'quantum-changelog-icon-enhancement'
      },
      updated: {
        displayName: 'Updated',
        iconClass: 'quantum-changelog-icon-updated'
      },
      added: {
        displayName: 'Added',
        iconClass: 'quantum-changelog-icon-added'
      }
    }
  }
}

module.exports = {
  resolve,
  defaultIssueUrl
}

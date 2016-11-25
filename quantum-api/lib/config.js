'use strict'

const javascript = require('./languages/javascript')
const css = require('./languages/css')

const bodyBuilders = require('./entity-transforms/builders/body-builders')

function defaultIssueUrl () {
  return undefined
}

const defaultOptions = {
  apiBuilders: [
    bodyBuilders.description(),
    bodyBuilders.extras(),
    bodyBuilders.groups(),
    bodyBuilders.properties(),
    bodyBuilders.prototypes(),
    bodyBuilders.objects(),
    bodyBuilders.functions(),
    bodyBuilders.classes()
  ],
  groupBuilders: [
    bodyBuilders.description(),
    bodyBuilders.extras(),
    bodyBuilders.groups(),
    bodyBuilders.params(),
    bodyBuilders.properties(),
    bodyBuilders.prototypes(),
    bodyBuilders.objects(),
    bodyBuilders.functions(),
    bodyBuilders.methods(),
    bodyBuilders.classes(),
    bodyBuilders.events()
  ],
  processChangelogs: true,
  targetVersions: undefined,
  languages: [
    javascript(),
    css()
  ],
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
    apiBuilders: resolveOption(options, 'apiBuilders'),
    groupBuilders: resolveOption(options, 'groupBuilders'),
    languages: resolveOption(options, 'languages'),
    targetVersions: resolveOption(options, 'targetVersions'),
    issueUrl: resolveOption(options, 'issueUrl'),
    processChangelogs: resolveOption(options, 'processChangelogs'),

    //XXX: come up with better names for these changlog-only options
    reverseVisibleList: resolveOption(options, 'reverseVisibleList'),
    groupByApi: resolveOption(options, 'groupByApi'),

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

'use strict'

const body = require('./entity-transforms/builders/body')
const javascript = require('./languages/javascript')
const css = require('./languages/css')

function defaultIssueUrl () {
  return undefined
}

const defaultOptions = {
  // Defines what the default api looks like
  apiBuilders: [
    body.description,
    body.extras,
    body.groups,
    javascript.properties,
    javascript.prototypes,
    javascript.objects,
    javascript.functions,
    css.classes
  ],
  // Defines what the default group looks like
  groupBuilders: [
    body.description,
    body.extras,
    body.groups,
    javascript.params,
    javascript.properties,
    javascript.prototypes,
    javascript.objects,
    javascript.functions,
    javascript.methods,
    javascript.events,
    css.classes
  ],
  processChangelogs: true,
  targetVersions: undefined,
  languages: [
    javascript(),
    css()
  ],
  changelogReverseVisibleList: false,
  changelogGroupByApi: false,
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
    changelogReverseVisibleList: resolveOption(options, 'changelogReverseVisibleList'),
    changelogGroupByApi: resolveOption(options, 'changelogGroupByApi')
  }
}

module.exports = {
  resolve,
  defaultIssueUrl
}

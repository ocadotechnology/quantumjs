'use strict'

const dom = require('quantum-dom')

const timesink = require('timesink')

/*
  The entity types this language handles - these entites can be represented as
  changelog entries by this language.
*/
const entityTypes = [
  'object',
  'prototype',
  'event',
  'constructor',
  'function',
  'method',
  'property',
  'property?'
]

/* Hashes an api entry to a string - used for linking entities together across versions */
function hashEntry (apiEntry, root) {
  const stop = timesink.start('hashEntry')
  let current = apiEntry
  let key = ''
  while(current !== root) {
    const type = current.type()
    const name = current.param(0)
    if (type === 'function' || type === 'method' || type === 'constructor') {
      key = '/' + type + ':' + name + ':' + current.selectAll(['param', 'param?']).map(p => p.params().join(':')).join(':') + key
    } else {
      key = '/' + type + ':' + name + key
    }
    current = current.parent()
  }
  stop()
  return key
}

/* Returns a changelog entry for the change between two entries. Can be undefined */
function changelogEntryForChange (selection, previousEntry, isFirstVersion) {
  /*
    Language rules
    1. If a description changes in any of the entityTypes, add an updated tag
    2. For function-like entries, any change to the return type or parameter descriptions should also cause an updated tag to be added
    3. For events, any changes to the data should case an updated tag to be added
  */
  return undefined
}

/* Builds the header ast for an entry */
function buildHeaderASTForEntry (entry) {
  const selection = entry.selection
  const type = selection.type()

  const headerContent = [
    {
      type: 'type',
      params: [type],
      content: []
    },
    {
      type: 'name',
      params: selection.param(0) ? [selection.param(0)] : [],
      content: []
    }
  ]

  if (type === 'function' || type === 'method' || type === 'constructor') {
    selection.selectAll(['param', 'param?']).forEach(param => {
      headerContent.push({
        type: param.type(),
        params: param.params().slice(),
        content: []
      })
    })

    if (selection.has('returns')) {
      headerContent.push({
        type: 'returns',
        params: selection.select('returns').params().slice(),
        content: []
      })
    }
  }

  if (type === 'function' || type === 'method' || type === 'constructor' || type === 'property' || type === 'property?' || type === 'event') {
    if (selection.parent() && selection.parent().type() === 'prototype' || selection.parent().type() === 'object') {
      headerContent.push({
        type: 'parent',
        params: [selection.parent().param(0), selection.parent().type()],
        content: []
      })
    }
  }

  return {
    type: 'header',
    params: [],
    content: headerContent
  }
}

function createDivider (selection) {
  const parent = selection.select('parent')
  const separator = selection.select('type').ps() === 'constructor' ? '' : (parent.param(1) === 'prototype' ? ':' : '.')
  return parent.param(0) + separator
}

function createHeader (selection) {
  const type = selection.select('type').ps()

  if (type === 'function' || type === 'method' || type === 'constructor') {
    return dom.create('span')
      .class('qm-changelog-javascript-function-header')
      .add(selection.has('parent') ? dom.create('span').class('qm-changelog-javascript-function-parent').text(createDivider(selection)) : undefined)
      .add(dom.create('span').class('qm-changelog-javascript-function-name').text(selection.select('name').ps()))
      .add(dom.create('span').class('qm-changelog-javascript-function-params')
        .add(selection.selectAll(['param', 'param?']).map(param => {
          return dom.create('span').class('qm-changelog-javascript-function-param')
            .add(dom.create('span').class('qm-changelog-javascript-function-param-name').text(param.param(0)))
            .add(dom.create('span').class('qm-changelog-javascript-function-param-type').text(param.param(1)))
        })))
  } else if (type === 'property' || type === 'property?' || type === 'event') {
    return dom.create('span')
      .class('qm-changelog-javascript-property-header')
      .add(selection.has('parent') ? dom.create('span').class('qm-changelog-javascript-property-parent').text(createDivider(selection)) : undefined)
      .add(dom.create('span').class('qm-changelog-javascript-property-name').text(selection.select('name').ps()))
  } else if (type === 'object' || type === 'prototype') {
    return dom.create('span')
      .class('qm-changelog-javascript-object-header')
      .add(dom.create('span').class('qm-changelog-javascript-object-name').text(selection.select('name').ps()))
  }
}

module.exports = {
  name: 'javascript',
  entityTypes: entityTypes,
  hashEntry: hashEntry,
  changelogEntryForChange: changelogEntryForChange,
  buildHeaderASTForEntry: buildHeaderASTForEntry,
  createHeader: createHeader
}

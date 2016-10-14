'use strict'

const dom = require('quantum-dom')

const timesink = require('timesink')

/*
  The entity types this language handles - these entites can be represented as
  changelog entries by this language.
*/
const entityTypes = [
  'class',
  'childclass',
  'extraclass'
]

/* Hashes an api entry to a string - used for linking entities together across versions */
function hashEntry (apiEntry, root) {
  const stop = timesink.start('css-hashEntry')
  let current = apiEntry
  let key = ''
  while(current !== root) {
    const type = current.type()
    const name = current.param(0)
    if (type === 'extraclass') {
      key += '.' + name
    } else {
      key += ' ' + name
    }
    current = current.parent()
  }
  stop()
  return key
}

/* Returns a changelog entry for the change between two entries. Can be undefined */
function changelogEntryForChange (selection, previousEntry, isFirstVersion) {
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
      params: selection.param(0) ? ['.' + selection.param(0)] : [],
      content: []
    }
  ]

  if (type === 'childclass' || type === 'extraclass') {
    if (selection.parent() && selection.parent().type() === 'class' || selection.parent().type() === 'childclass' || selection.parent().type() === 'extraclass') {
      headerContent.push({
        type: 'parent',
        params: ['.' + selection.parent().param(0), selection.parent().type()],
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
  const separator = selection.select('type').ps() === 'childclass' ? ' ' : ''
  return parent.param(0) + separator
}

function createHeader (selection) {
  const type = selection.select('type').ps()

  return dom.create('span')
    .class('qm-changelog-javascript-property-header')
    .add(selection.has('parent') ? dom.create('span').class('qm-changelog-javascript-property-parent').text(createDivider(selection)) : undefined)
    .add(dom.create('span').class('qm-changelog-javascript-property-name').text(selection.select('name').ps()))
}

module.exports = {
  name: 'css',
  entityTypes: entityTypes,
  hashEntry: hashEntry,
  changelogEntryForChange: changelogEntryForChange,
  buildHeaderASTForEntry: buildHeaderASTForEntry,
  createHeader: createHeader
}

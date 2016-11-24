'use strict'

const path = require('path')
const dom = require('quantum-dom')

/*
  The entity types this language handles - these entites can be represented as
  changelog entries by this language.
*/
const entityTypes = [
  'class',
  'childclass',
  'extraclass'
]

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-changelog/languages/css.css',
    file: path.join(__dirname, '../../assets/languages/css.css'),
    shared: true
  })
]

/* Hashes an api entry to a string - used for linking entities together across versions */
function hashEntry (apiEntry, root) {
  let current = apiEntry
  let key = ''
  while (current !== root) {
    const type = current.type()
    const name = current.param(0)
    if (type === 'extraclass') {
      key += '.' + name
    } else if (type === 'childclass') {
      key += ' > ' + name
    } else if (type === 'class') {
      key += ' ' + name
    } else {
      return undefined
    }
    current = current.parent()
  }
  return key
}

function extractEntry (selection, previousExtraction) {
  let s = selection
  const entries = []
  while (s) {
    entries.unshift({
      type: s.type(),
      name: s.ps()
    })
    s = s.parent() && entityTypes.indexOf(s.parent().type()) !== -1 ? s.parent() : undefined
  }

  const apiEntry = {
    entries
  }

  const changes = []

  return { apiEntry, changes }
}

/* Builds the header ast for an entry */
function buildEntryHeaderAst (apiEntryChanges) {
  const apiEntry = apiEntryChanges.apiEntry
  const entries = apiEntry.entries

  const content = []
  let currentContent = content
  entries.forEach(entry => {
    const newContent = []
    currentContent.push({
      type: entry.type,
      params: [entry.name],
      content: newContent
    })
    currentContent = newContent
  })

  return {
    type: 'header',
    params: ['css'],
    content: content
  }
}

function createHeaderDom (selection) {
  if (entityTypes.some(entityType => selection.has(entityType))) {
    const header = dom.create('span')
      .class('qm-changelog-css-header')

    let current = selection
    while (entityTypes.some(entityType => current.has(entityType))) {
      current = current.select(entityTypes)
      header.add(dom.create('span')
        .class('qm-changelog-css-' + current.type())
        .text(current.ps()))
    }

    return header
  }
}

module.exports = {
  name: 'css',
  entityTypes: entityTypes,
  assets: assets,
  hashEntry: hashEntry,
  extractEntry: extractEntry,
  buildEntryHeaderAst: buildEntryHeaderAst,
  createHeaderDom: createHeaderDom
}

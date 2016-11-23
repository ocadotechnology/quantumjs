'use strict'

const path = require('path')

const dom = require('quantum-dom')
const html = require('quantum-html')
const quantum = require('quantum-js')

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

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-changelog/languages/javascript.css',
    file: path.join(__dirname, '../../assets/languages/javascript.css'),
    shared: true
  })
]


/* Hashes an api entry to a string - used for linking entities together across versions */
//XXX: can be simplified so that the while loop is done for you by page-transform
function hashEntry (apiEntry, root) {
  let current = apiEntry
  let key = ''
  while (current !== root) {
    const type = current.type()
    const name = current.param(0)
    if (entityTypes.indexOf(type) === -1) {
      return undefined
    }
    if (type === 'function' || type === 'method' || type === 'constructor') {
      key = '/' + type + ':' + name + '(' + current.selectAll(['param', 'param?']).map(p => p.params().join(':')).join(',') + ')' + key
    } else {
      key = '/' + type + ':' + name + key
    }
    current = current.parent()
  }

  return key
}

/*
  Extracts the useful information from a selection and returns an object that
  represents that api entry. This is only used by this language, so can be
  whatever we want
*/
function extractEntry (selection, previousExtraction) {

  // build the faux-ast (can change for the proper ast soon)
  let s = selection
  const entries = []
  while(s) {
    entries.unshift({
      type: s.type(),
      params: s.params(),
      functionParams: s.selectAll(['param', 'param?']).map(param => {
        return {
          paramType: param.type(),
          name: param.param(0) || '',
          type: param.param(1) || ''
        }
      }),
      returns: s.has('returns') ? s.select('returns').ps() : undefined
    })
    s = s.parent() && entityTypes.indexOf(s.parent().type()) !==-1 ? s.parent() : undefined
  }

  // for tracking changes
  const returnType = selection.has('returns') ? selection.select('returns').ps() : undefined

  const apiEntry = {
    entries,
    returnType
  }

  const changes = []

  // add extra changelog changes to the entry (language specific)
  const type = selection.type()
  if (type === 'function' || type === 'method') {
    const returnTypeHasChanged = (returnType && previousExtraction) ? previousExtraction.returnType !== returnType : false

    const returnTypeChange = returnTypeHasChanged ? {
      oldType: previousExtraction ? previousExtraction.returnType : undefined,
      newType: returnType
    } : undefined

    if (returnTypeChange) {
      //XXX: feels very verbose for an exposed api
      changes.push({
        tagType: 'updated',
        selection: quantum.select({
          type: 'updated',
          params: [],
          content: [
            { type: 'description', params: [], content: ['Return type changed to ' + returnTypeChange.newType]}
          ]
        })
      })
    }
  }

  return { apiEntry, changes }
}

/* Builds the header ast for an entry */
function buildEntryHeaderAst (apiEntryChanges) {
  //XXX: do this ast building in extract entry
  const apiEntry = apiEntryChanges.apiEntry

  const entries = apiEntry.entries

  const content = []
  let currentContent = content
  entries.forEach(entry => {
    const newContent = entry.functionParams.map(param => {
      return {
        type: param.paramType,
        params: [param.name, param.type],
        content: []
      }
    })

    if (entry.returns) {
      newContent.push({
        type: 'returns',
        params: [entry.returns],
        content: []
      })
    }

    currentContent.push({
      type: entry.type,
      params: entry.params,
      content: newContent
    })
    currentContent = newContent
  })

  return {
    type: 'header',
    params: ['javascript'],
    content: content
  }
}

function createHeaderDom (selection, transform) {
  if (entityTypes.some(entityType => selection.has(entityType))) {
    const header = dom.create('span')
      .class('qm-changelog-javascript-header')

    let current = selection
    while (entityTypes.some(entityType => current.has(entityType)))  {
      current = current.select(entityTypes)

      const type = current.type()

      const section = dom.create('span')
        .class('qm-changelog-javascript-' + current.type())
        .add(dom.create('span').class('qm-changelog-javascript-name').text(current.param(0)))

      if (type === 'function' || type === 'method' || type === 'constructor') {
        const params = dom.create('span').class('qm-changelog-javascript-params')
          .add(current.selectAll(['param', 'param?']).map(param => {
            return dom.create('span').class('qm-changelog-javascript-param')
              .add(dom.create('span').class('qm-changelog-javascript-param-name').text(param.param(0)))
              .add(dom.create('span').class('qm-changelog-javascript-param-type').text(param.param(1)))
          }))

        section.add(params)
      } else if (type === 'property' || type === 'property?' || type === 'event') {
        section.add(dom.create('span').class('qm-changelog-javascript-type').text(current.param(1)))
      }

      header.add(section)
    }

    return header
  }
}

module.exports = {
  name: 'javascript',
  entityTypes: entityTypes,
  assets: assets,
  hashEntry: hashEntry,
  extractEntry: extractEntry,
  buildEntryHeaderAst: buildEntryHeaderAst,
  createHeaderDom: createHeaderDom
}

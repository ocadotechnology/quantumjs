'use strict'

const dom = require('quantum-dom')
const html = require('quantum-html')
const quantum = require('quantum-js')

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
  const stop = timesink.start('javascript-hashEntry')
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
  stop()

  return key
}

/*
  Extracts the useful information from a selection and returns an object that
  represents that api entry. This is only used by this language, so can be
  whatever we want
*/
function extractEntry (selection, previousExtraction) {
  const returnType = selection.has('returns') ? selection.select('returns').ps() : undefined

  const type = selection.type()

  const apiEntry = {
    type: type,
    name: selection.param(0),
    parentType: selection.parent() ? selection.parent().type() : undefined,
    parentName: selection.parent() ? selection.parent().param(0) : undefined,
    params: selection.selectAll(['param', 'param?']).map(param => {
      return {
        paramType: param.type(),
        name: param.param(0) || '',
        type: param.param(1) || ''
      }
    }),
    returnType: returnType
  }

  const changes = []

  // add extra changelog changes to the entry (language specific)
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
  const apiEntry = apiEntryChanges.apiEntry

  const type = apiEntry.type
  const name = apiEntry.name
  const params = apiEntry.params
  const returnType = apiEntry.returnType
  const parentType = apiEntry.parentType
  const parentName = apiEntry.parentName

  const content = [
    {
      type: 'name',
      params: name ? [name] : [],
      content: []
    }
  ]

  if (type === 'function' || type === 'method' || type === 'constructor') {
    params.forEach(param => {
      content.push({
        type: param.paramType,
        params: [param.name, param.type],
        content: []
      })
    })

    if (returnType) {
      content.push({
        type: 'returns',
        params: [returnType],
        content: []
      })
    }
  }

  if (type === 'function' || type === 'method' || type === 'constructor' || type === 'property' || type === 'property?' || type === 'event') {
    if (parentType === 'prototype' || parentType === 'object') {
      content.push({
        type: 'parent',
        params: [parentName, parentType],
        content: []
      })
    }
  }

  return {
    type: 'header',
    params: [type],
    content: content
  }
}

function createDivider (selection) {
  const parent = selection.select('parent')
  const separator = selection.select('type').ps() === 'constructor' ? '' : (parent.param(1) === 'prototype' ? ':' : '.')
  return parent.param(0) + separator
}

function createHeaderDom (selection, transforms) {
  const type = selection.ps()

  // XXX: add icons for each of the types (functions, prototypes, events etc)

  if (type === 'function' || type === 'method' || type === 'constructor') {
    return dom.create('span').class('qm-changelog-javascript-function-header')
      .add(selection.has('parent') ? dom.create('span').class('qm-changelog-javascript-function-parent').text(createDivider(selection)) : undefined)
      .add(dom.create('span').class('qm-changelog-javascript-function-name').text(selection.select('name').ps()))
      .add(dom.create('span').class('qm-changelog-javascript-function-params')
        .add(selection.selectAll(['param', 'param?']).map(param => {
          return dom.create('span').class('qm-changelog-javascript-function-param')
            .add(dom.create('span').class('qm-changelog-javascript-function-param-name').text(param.param(0)))
            .add(dom.create('span').class('qm-changelog-javascript-function-param-type').text(param.param(1)))
        })))
  } else if (type === 'property' || type === 'property?' || type === 'event') {
    return dom.create('span').class('qm-changelog-javascript-property-header')
      .add(selection.has('parent') ? dom.create('span').class('qm-changelog-javascript-property-parent').text(createDivider(selection)) : undefined)
      .add(dom.create('span').class('qm-changelog-javascript-property-name').text(selection.select('name').ps()))
  } else if (type === 'object' || type === 'prototype') {
    return dom.create('span').class('qm-changelog-javascript-object-header')
      .add(dom.create('span').class('qm-changelog-javascript-object-name').text(selection.select('name').ps()))
  }
}

module.exports = {
  name: 'javascript',
  entityTypes: entityTypes,
  hashEntry: hashEntry,
  extractEntry: extractEntry,
  buildEntryHeaderAst: buildEntryHeaderAst,
  createHeaderDom: createHeaderDom
}

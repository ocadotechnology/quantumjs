'use strict'

const path = require('path')
const dom = require('quantum-dom')
const header = require('../entity-transforms/components/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-api-quantum.css',
    file: path.join(__dirname, '../../assets/languages/quantum-api-quantum.css'),
    shared: true
  })
]

function entityHeaderDetails (selection) {
  return dom.create('span')
    .class('qm-api-header-entity-name')
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(selection.param(0))
}

function entityHeader (selection, transforms) {
  const details = entityHeaderDetails(selection)
  return header(selection.type(), details, selection, transforms)
}

const description = body.description
const extras = body.extras
const groups = body.groups
const entities = itemGroup('entity', 'Entities')

const entityBuilder = item({
  class: 'qm-api-quantum-entity',
  header: entityHeader,
  content: [ description, extras, groups, entities ]
})

/* The config for building css api docs */
function api () {
  return {
    entity: entityBuilder
  }
}

/*
  The entity types this language handles - these entites can be represented as
  changelog entries by this language.
*/
const changelogEntityTypes = [
  'entity'
]

function createChangelogHeaderDom (selection) {
  if (changelogEntityTypes.some(entityType => selection.has(entityType))) {
    const header = dom.create('span')
      .class('qm-changelog-quantum-header')

    let current = selection
    while (changelogEntityTypes.some(entityType => current.has(entityType))) {
      current = current.select(changelogEntityTypes)
      header.add(dom.create('span')
        .class(`qm-changelog-quantum-${current.type()}`)
        .text(current.ps()))
    }
    return header
  }
}

module.exports = (options) => {
  return {
    name: 'quantum',
    api: api(),
    changelog: {
      assets,
      entityTypes: changelogEntityTypes,
      createHeaderDom: createChangelogHeaderDom
    }
  }
}

module.exports.entities = entities

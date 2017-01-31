'use strict'

const path = require('path')
const dom = require('quantum-dom')
const header = require('../entity-transforms/builders/header')
const body = require('../entity-transforms/builders/body')
const item = require('../entity-transforms/builders/item')
const itemGroup = require('../entity-transforms/builders/item-group')

/*
  The assets that should be included on the page for this language
*/
const assets = [
  dom.asset({
    url: '/quantum-api-css.css',
    file: path.join(__dirname, '../../assets/languages/quantum-api-css.css'),
    shared: true
  })
]

const nameHeader = header.nameHeader()

const description = body.description
const extras = body.extras
const groups = body.groups
const classes = itemGroup('class', 'Classes')
const extraClasses = itemGroup('extraclass', 'Extra Classes')
const childClasses = itemGroup('childclass', 'Child Classes')

const classBuilder = item({
  class: 'qm-api-class',
  header: nameHeader,
  content: [ description, extras, groups, classes, extraClasses, childClasses ]
})

const extraclassBuilder = item({
  class: 'qm-api-extraclass',
  header: nameHeader,
  content: [ description, extras, groups, classes, extraClasses, childClasses ]
})

const childclassBuilder = item({
  class: 'qm-api-childclass',
  header: nameHeader,
  content: [ description, extras, groups, classes, extraClasses, childClasses ]
})

/* The config for building css api docs */
function api () {
  return {
    class: classBuilder,
    extraclass: extraclassBuilder,
    childclass: childclassBuilder
  }
}

/*
  The entity types this language handles - these entites can be represented as
  changelog entries by this language.
*/
const changelogEntityTypes = [
  'class',
  'childclass',
  'extraclass'
]

function createChangelogHeaderDom (selection) {
  if (changelogEntityTypes.some(entityType => selection.has(entityType))) {
    const header = dom.create('span')
      .class('qm-changelog-css-header')

    let current = selection
    while (changelogEntityTypes.some(entityType => current.has(entityType))) {
      current = current.select(changelogEntityTypes)
      header.add(dom.create('span')
        .class('qm-changelog-css-' + current.type())
        .text(current.ps()))
    }
    return header
  }
}

module.exports = (options) => {
  return {
    name: 'css',
    api: api(),
    changelog: {
      entityTypes: changelogEntityTypes,
      assets: assets, // XXX bump up
      createHeaderDom: createChangelogHeaderDom
    }
  }
}

module.exports.classes = classes
module.exports.extraClasses = extraClasses
module.exports.childClasses = childClasses

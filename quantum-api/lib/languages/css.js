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
    filename: path.join(__dirname, '../../assets/languages/quantum-api-css.css'),
    shared: true
  })
]

function nameHeaderDetails (selection, transformer) {
  const name = selection.param(0)
  return dom.create('span')
    .class(`qm-api-css-header-name`)
    .attr('id', name ? name.toLowerCase() : undefined)
    .add(name || '')
}

const classHeader = header('class', nameHeaderDetails)
const extraClassHeader = header('extra-class', nameHeaderDetails)

const description = body.description
const extras = body.extras
const groups = body.groups
const classes = itemGroup('css', 'class', 'Classes')
const extraClasses = itemGroup('css', 'extraClass', 'Extra Classes')

const classBuilder = item({
  class: 'qm-api-class',
  header: classHeader,
  content: [ description, extras, groups, classes, extraClasses ]
})

const extraClassBuilder = item({
  class: 'qm-api-extra-class',
  header: extraClassHeader,
  content: [ description, extras, groups, classes, extraClasses ]
})

const baseTypeClasses = {
  class: 'class',
  extraClass: 'extra-class'
}

function createHeaderDom (changelogHeaders) {
  const entityTypes = Object.keys(changelogHeaders)
  return (selection, transformer) => {
    if (entityTypes.some(entityType => selection.has(entityType))) {
      let current = selection
      const sections = []
      while (entityTypes.some(entityType => current.has(entityType))) {
        current = current.select(entityTypes)
        const type = current.type()
        const baseType = baseTypeClasses[type.replace('?', '')]

        const section = dom.create('span')
          .class(`qm-changelog-css-${baseType}`)
          .add(changelogHeaders[type](current, transformer))

        sections.push(section)
      }
      return dom.create('span')
        .class('qm-changelog-css-header')
        .add(sections)
    }
  }
}

module.exports = (options) => {
  const changelogHeaderTransforms = {
    class: classHeader,
    extraClass: extraClassHeader
  }

  return {
    assets,
    name: 'css',
    transforms: {
      class: classBuilder,
      extraClass: extraClassBuilder
    },
    changelog: {
      entityTypes: Object.keys(changelogHeaderTransforms),
      createHeaderDom: createHeaderDom(changelogHeaderTransforms)
    }
  }
}

module.exports.classes = classes
module.exports.extraClasses = extraClasses

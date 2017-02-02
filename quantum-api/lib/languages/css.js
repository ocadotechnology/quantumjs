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

function nameHeaderDetails (selection, transformer) {
  return dom.create('span')
    .class(`qm-api-css-header-name`)
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(selection.param(0))
}

const classHeader = header('class', nameHeaderDetails)
const extraClassHeader = header('extra-class', nameHeaderDetails)
const childClassHeader = header('child-class', nameHeaderDetails)

const description = body.description
const extras = body.extras
const groups = body.groups
const classes = itemGroup('class', 'Classes')
const extraClasses = itemGroup('extraclass', 'Extra Classes')
const childClasses = itemGroup('childclass', 'Child Classes')

const classBuilder = item({
  class: 'qm-api-class',
  header: classHeader,
  content: [ description, extras, groups, classes, extraClasses, childClasses ]
})

const extraclassBuilder = item({
  class: 'qm-api-extraclass',
  header: extraClassHeader,
  content: [ description, extras, groups, classes, extraClasses, childClasses ]
})

const childclassBuilder = item({
  class: 'qm-api-childclass',
  header: childClassHeader,
  content: [ description, extras, groups, classes, extraClasses, childClasses ]
})

module.exports = (options) => {
  return {
    assets,
    name: 'css',
    transforms: {
      class: classBuilder,
      extraclass: extraclassBuilder,
      childclass: childclassBuilder
    },
    changelogHeaderTransforms: {
      class: classHeader,
      childclass: extraClassHeader,
      extraclass: childClassHeader
    }
  }
}

module.exports.classes = classes
module.exports.extraClasses = extraClasses
module.exports.childClasses = childClasses

'use strict'

const dom = require('quantum-dom')
const quantum = require('quantum-js')
const itemGroupBuilder = require('./item-group-builder')
const html = require('quantum-html')
const organisedEntity = require('../utils/organised-entity').organisedEntity

function description (selection, transforms) {
  if (selection.has('description')) {
    return dom.create('div')
      .class('qm-api-description')
      .add(html.paragraphTransform(selection.select('description'), transforms))
  } else if (selection.hasContent()) {
    return dom.create('div')
      .class('qm-api-description')
      .text(selection.cs().trim())
  }
}

function defaultValue (selection, transforms) {
  if (selection.has('default')) {
    return dom.create('div').class('qm-api-default')
      .add(dom.create('span').class('qm-api-default-key').text('Default: '))
      .add(dom.create('span').class('qm-api-default-value').text(selection.select('default').cs()))
  }
}

function extras (selection, transforms) {
  if (selection.has('extra')) {
    return dom.create('div').class('qm-api-extras').add(
      dom.all(selection.selectAll('extra').map((e) => {
        return dom.create('div').class('qm-api-extra')
          .add(html.paragraphTransform(e, transforms))
      })))
  }
}

/* Creates a custom group of entries (rather than the natural grouping things fall into) */
function groups (selection, transforms) {
  if (selection.has('group')) {
    const sortedEntity = selection.filter('group')
    return dom.create('div').class('qm-api-groups')
      .add(dom.all(sortedEntity.selectAll('group').map(organisedEntity).map((groupSelection) => {
        return dom.create('div').class('qm-api-group')
          .add(dom.create('h2').text(groupSelection.ps()))
          .add(dom.create('div').class('qm-api-group-content')
            .add(description(groupSelection, transforms))
            .add(groupSelection
              .filter(entity => quantum.select.isEntity(entity) && entity.type !== 'description')
              .transform(transforms)))
      })))
  }
}

module.exports = {
  description: (options) => description,
  groups: (options) => groups,
  extras: (options) => extras,
  defaultValue: (options) => defaultValue,
  prototypes: (options) => itemGroupBuilder('prototype', 'Prototypes'),
  constructors: (options) => itemGroupBuilder('constructor', 'Constructors'),
  objects: (options) => itemGroupBuilder('object', 'Objects'),
  params: (options) => itemGroupBuilder(['param', 'param?'], 'Arguments', { noSort: true }),
  properties: (options) => itemGroupBuilder(['property', 'property?'], 'Properties'),
  methods: (options) => itemGroupBuilder('method', 'Methods'),
  events: (options) => itemGroupBuilder('event', 'Events'),
  functions: (options) => itemGroupBuilder('function', 'Functions'),
  returns: (options) => itemGroupBuilder('returns', 'Returns'),
  classes: (options) => itemGroupBuilder('class', 'Classes'),
  extraClasses: (options) => itemGroupBuilder('extraclass', 'Extra Classes'),
  childClasses: (options) => itemGroupBuilder('childclass', 'Child Classes')
}

'use strict'

const dom = require('quantum-dom')
const quantum = require('quantum-js')
const itemGroupBuilder = require('./item-group')
const html = require('quantum-html')
const utils = require('../../utils')

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

/* Creates a custom group of entries (rather than the natural grouping things fall into) */
function groups (selection, transforms) {
  if (selection.has('group')) {
    const sortedEntity = selection.filter('group')
    return dom.create('div').class('qm-api-groups')
      .add(sortedEntity.selectAll('group').map(utils.organisedEntity).map((groupSelection) => {
        return dom.create('div').class('qm-api-group')
          .add(dom.create('h2').text(groupSelection.ps()))
          .add(dom.create('div').class('qm-api-group-content')
            .add(description(groupSelection, transforms))
            .add(groupSelection
              .filter(entity => quantum.select.isEntity(entity) && entity.type !== 'description')
              .transform(transforms)))
      }))
  }
}

function defaultValue (selection, transforms) {
  if (selection.has('default')) {
    return dom.create('div').class('qm-api-default')
      .add(dom.create('span').class('qm-api-default-key').text('Default: '))
      .add(dom.create('span').class('qm-api-default-value').add(selection.select('default').transform(transforms)))
  }
}

function extras (selection, transforms) {
  if (selection.has('extra')) {
    return dom.create('div').class('qm-api-extras').add(
      selection.selectAll('extra').map((e) => {
        return dom.create('div').class('qm-api-extra')
          .add(html.paragraphTransform(e, transforms))
      }))
  }
}

module.exports = {
  description,
  groups,
  extras,
  default: defaultValue,
}
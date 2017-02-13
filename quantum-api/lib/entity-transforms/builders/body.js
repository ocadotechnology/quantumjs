'use strict'

const dom = require('quantum-dom')
const quantum = require('quantum-js')
const html = require('quantum-html')
const utils = require('../../utils')

function description (selection, transformer) {
  if (selection.has('description')) {
    return dom.create('div')
      .class('qm-api-description')
      .add(html.paragraphTransform(selection.select('description'), transformer))
  } else if (selection.hasContent()) {
    return dom.create('div')
      .class('qm-api-description')
      .text(selection.cs().trim())
  }
}

/* Creates a custom group of entries (rather than the natural grouping things fall into) */
function groups (selection, transformer) {
  if (selection.has('group')) {
    const sortedEntity = selection.filter('group')
    return dom.create('div').class('qm-api-groups')
      .add(sortedEntity.selectAll('group').map(utils.organisedEntity).map((groupSelection) => {
        const nestedGroups = groupSelection.filter('group')
        return dom.create('div').class('qm-api-group')
          .add(dom.create('div').class('qm-api-group-header qm-header-font').text(groupSelection.ps()))
          .add(dom.create('div').class('qm-api-group-content')
            .add(description(groupSelection, transformer))
            .add(groupSelection
              .filter(entity => quantum.select.isEntity(entity) && entity.type !== 'description' && entity.type !== 'group')
              .transform(transformer))
            .add(groups(nestedGroups, transformer)))
      }))
  }
}

function defaultValue (selection, transformer) {
  if (selection.has('default')) {
    return dom.create('div').class('qm-api-default')
      .add(dom.create('span').class('qm-api-default-key').text('Default: '))
      .add(dom.create('span').class('qm-api-default-value').add(selection.select('default').transform(transformer)))
  }
}

function extras (selection, transformer) {
  if (selection.has('extra')) {
    return dom.create('div').class('qm-api-extras').add(
      selection.selectAll('extra').map((e) => {
        return dom.create('div').class('qm-api-extra')
          .add(html.paragraphTransform(e, transformer))
      }))
  }
}

module.exports = {
  description,
  groups,
  extras,
  default: defaultValue
}

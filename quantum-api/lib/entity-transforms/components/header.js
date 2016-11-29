'use strict'

const dom = require('quantum-dom')

// XXX: get the tags from options
const tags = ['removed', 'deprecated', 'enhancement', 'bugfix', 'updated', 'added', 'info']

/* Gets the tags that should be applied to an entry */
function getTags (selection) {
  const selectionTags = []

  if (selection.has('added')) {
    selectionTags.push('added')
  }
  if (selection.has('deprecated')) {
    selectionTags.push('deprecated')
  }
  if (selection.has('removed')) {
    selectionTags.push('removed')
  }

  // check if the entry has been directly updated, or if any of the children have been updated
  // the child check is done second as it is potentially an expensive operation
  if (selection.has('updated') || (!tags.some(tag => selection.has(tag)) && tags.some(tag => selection.has(tag, {recursive: true})))) {
    selectionTags.push('updated')
  }

  return selectionTags
}

/* Creates a set of tag elements for displaying changes to an entry */
function createHeaderTags (tags) {
  const tagElements = tags.map(name => {
    return dom.create('span')
      .class('qm-api-tag qm-api-tag-' + name)
      .text(name)
  })

  return dom.create('span')
    .class('qm-api-header-tags')
    .add(tagElements)
}

/* General template for headers (handles the tags automatically, just provide the headerContent span) */
module.exports = function header (type, headerContent, selection) {
  const tags = getTags(selection)
  const tagClasses = tags.map((name) => 'qm-api-' + name).join(' ')

  return dom.create('div').class('qm-api-item-header qm-api-' + type + '-header')
    .add(headerContent.class('qm-api-header-details').classed(tagClasses, true))
    .add(createHeaderTags(tags))
}

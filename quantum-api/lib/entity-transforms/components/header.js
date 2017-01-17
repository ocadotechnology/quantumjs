'use strict'

const dom = require('quantum-dom')
const tags = require('../../tags')

/* Creates a set of tag elements for displaying changes to an entry */
function createHeaderTags (tags) {
  return dom.create('span')
    .class('qm-api-header-tags')
    .add(tags.map(name => {
      return dom.create('span')
        .class('qm-api-tag qm-api-tag-' + name)
        .text(name)
    }))
}

/* General template for headers (handles the tags automatically, just provide the headerContent span) */
module.exports = function header (type, headerContent, selection) {
  const foundTags = Array.from(new Set(selection.selectAll(tags).map(t => t.type())))
  const sortedTags = tags.sortByTags(foundTags, (x) => x)
  const tagClasses = foundTags.map((name) => 'qm-api-' + name).join(' ')

  return dom.create('div').class('qm-api-item-header qm-api-' + type + '-header')
    .add(headerContent.classed('qm-api-header-details', true).classed(tagClasses, true))
    .add(createHeaderTags(sortedTags))
}

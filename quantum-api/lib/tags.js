'use strict'

const tags = [
  'added',
  'updated',
  'bugfix',
  'deprecated',
  'removed',
  'info'
]

const displayName = {
  added: 'Added',
  updated: 'Updated',
  bugfix: 'Bugfix',
  deprecated: 'Deprecated',
  removed: 'Removed',
  info: 'Info'
}

const order = {}
tags.forEach((tag, i) => {
  order[tag] = i
})

function sortByTags (list, f) {
  return list.sort((a, b) => order[f(a)] < order[f(b)] ? -1 : 1)
}

module.exports = tags
module.exports.displayName = displayName
module.exports.order = order
module.exports.sortByTags = sortByTags

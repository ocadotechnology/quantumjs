'use strict'

const quantum = require('quantum-js')

/* Checks which order two entities should be placed in the list of entries */
function compareEntities (a, b) {
  if (a.params && b.params && a.params[0] < b.params[0]) {
    return -1
  } else if (a.params && b.params && a.params[0] > b.params[0]) {
    return 1
  } else {
    return 0
  }
}

/* Creates a new (selected) entity from the selection with the entries sorted */
function organisedEntity (selection, opts) {
  if (opts && opts.noSort) {
    return selection
  } else {
    const added = []
    const updated = []
    const existing = []
    const deprecated = []
    const removed = []

    selection.content().forEach(entity => {
      if (quantum.select.isEntity(entity)) {
        const selection = quantum.select(entity)
        if (selection.has('removed')) {
          removed.push(entity)
        } else if (selection.has('deprecated')) {
          deprecated.push(entity)
        } else if (selection.has('updated')) {
          updated.push(entity)
        } else if (selection.has('added')) {
          added.push(entity)
        } else {
          existing.push(entity)
        }
      } else {
        existing.push(entity)
      }
    })

    const sortedAdded = added.sort(compareEntities)
    const sortedUpdated = updated.sort(compareEntities)
    const sortedExisting = existing.sort(compareEntities)
    const sortedDeprecated = deprecated.sort(compareEntities)
    const sortedRemoved = removed.sort(compareEntities)

    const newContent = sortedAdded
      .concat(sortedUpdated)
      .concat(sortedDeprecated)
      .concat(sortedRemoved)
      .concat(sortedExisting)

    return quantum.select({
      type: selection.type(),
      params: selection.params(),
      content: newContent
    })
  }
}

module.exports = {
  compareEntities: compareEntities,
  organisedEntity: organisedEntity
}

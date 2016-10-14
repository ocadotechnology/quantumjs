'use strict'

/* A function for comparing two semantic versions (that can be fed to sort()) */
function semanticVersionComparator (v1, v2) {
  const [major1, minor1, patch1] = v1.split('.').map(Number)
  const [major2, minor2, patch2] = v2.split('.').map(Number)
  if (major1 > major2) {
    return 1
  } else if (major1 === major2) {
    if (minor1 > minor2) {
      return 1
    } else if (minor1 === minor2) {
      if (patch1 > patch2) {
        return 1
      } else if (patch1 === patch2) {
        return 0
      } else {
        return -1
      }
    } else {
      return -1
    }
  } else {
    return -1
  }
}

const typeOrder = {
  added: 0,
  removed: 1,
  updated: 2,
  enhancement: 3,
  bugfix: 4,
  information: 5,
  deprecated: 6
}

/* Compares entries for sorting - groups by entry type, then sorts by name */
function compareEntrySelections (e1, e2) {
  const type1 = e1.type()
  const type2 = e2.type()
  if (typeOrder[type1] !== typeOrder[type2]) {
    return typeOrder[type1] - typeOrder[type2]
  } else {
    const name1 = e1.select('header').select('name').param(0)
    const name2 = e2.select('header').select('name').param(0)
    return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
  }
}

module.exports = {
  semanticVersionComparator: semanticVersionComparator,
  compareEntrySelections: compareEntrySelections
}

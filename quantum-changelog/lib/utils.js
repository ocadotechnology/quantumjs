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

module.exports = {
  semanticVersionComparator: semanticVersionComparator
}

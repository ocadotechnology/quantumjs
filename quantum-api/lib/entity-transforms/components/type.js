'use strict'

const dom = require('quantum-dom')

// Lookup the type url from the availble type links
function getType (str, typeLinks) {
  if (str in typeLinks) {
    return dom.create('a').class('qm-api-type-link').attr('href', typeLinks[str]).text(str)
  } else {
    return str
  }
}

// Create an array of strings that are either '[', ']', '/' or a string that can be converted to a type
function getTypeArray (typeString) {
  const letters = typeString.split('')
  const elements = []
  let acc = ''

  while (letters.length) {
    const letter = letters.shift()
    // Ignore spaces
    if (letter !== ' ') {
      switch (letter) {
        case '[':
        case ']':
        case '/':
          if (acc.length) {
            elements.push(acc)
            acc = ''
          }
          elements.push(letter === '/' ? ' / ' : letter)
          break
        default:
          acc += letter
      }
    }
    continue
  }
  if (acc.length) {
    elements.push(acc)
    acc = ''
  }
  return elements
}

/* Creates a span containing one or more / separated types (complete with links for known types) */
module.exports = function createType (typeString, typeLinks) {
  if (typeString !== undefined && typeString !== '') {
    return dom.create('span')
      .class('qm-api-type')
      .add(getTypeArray(typeString).map(t => getType(t, typeLinks)))
  }
}

module.exports.getTypeArray = getTypeArray

'use strict'

const dom = require('quantum-dom')

/* Creates links for parameterised types (eg. Promise[Array[String]]) */
function createParameterisedLinkedType (typeString, typeLinks) {
  const innerTypeString = typeString.slice(typeString.indexOf('[') + 1, typeString.lastIndexOf(']'))
  return [
    createSingleLinkedType(typeString.slice(0, typeString.indexOf('[')), typeLinks),
    '[', createLinkedType(innerTypeString, typeLinks), ']'
  ]
}

/* Creates types (with links to documentation for the type if possible) to an element */
function createSingleLinkedType (typeString, typeLinks) {
  const types = typeString.split('/')
  const elements = []
  types.forEach((type, index) => {
    if (type in typeLinks) {
      elements.push(dom.create('a').class('qm-api-type-link').attr('href', typeLinks[type]).text(type))
    } else {
      elements.push(type)
    }
    if (index !== types.length - 1) {
      elements.push(' / ')
    }
  })
  return elements
}

/* Creates types to a string (eg. Array[String]), taking care of parameterised types `Array[T]`, or single types `String` */
function createLinkedType (typeString, typeLinks) {
  if (typeString.indexOf('[') > -1) {
    return createParameterisedLinkedType(typeString, typeLinks)
  } else {
    return createSingleLinkedType(typeString, typeLinks)
  }
}

/* Creates a span containing one or more / separated types (complete with links for known types) */
module.exports = function createType (typeString, typeLinks) {
  if (typeString !== undefined && typeString !== '') {
    return dom.create('span')
      .class('qm-api-type')
      .add(createLinkedType(typeString, typeLinks))
  }
}

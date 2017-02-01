'use strict'

const dom = require('quantum-dom')
const header = require('../components/header')
const type = require('../components/type')

/* A simple header that just displays the first parameter in the entry */
function nameHeaderDetails (selection, typeLinks) {
  return dom.create('span')
    .class('qm-api-header-name')
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(selection.param(0))
}

/* A header for displaying a type (which may have a link for further documentation) */
function typeHeaderDetails (selection, typeLinks) {
  return dom.create('span')
    .class('qm-api-header-type')
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(type(selection.param(0), typeLinks))
}

/* A header that shows useful information for a property entry */
function propertyHeaderDetails (selection, typeLinks) {
  return dom.create('span')
    .class('qm-api-header-property')
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(dom.create('span').class('qm-api-header-property-name').text(selection.param(0) || ''))
    .add(dom.create('span').class('qm-api-header-property-type').add(type(selection.param(1), typeLinks)))
}

/* A header that shows useful information for a function entry */
function functionHeaderDetails (selection, typeLinks) {
  const name = dom.create('span')
    .class('qm-api-header-function-name')
    .text(selection.type() === 'constructor' ? 'constructor' : selection.param(0))

  const params = selection.selectAll(['param', 'param?']).map((param) => {
    const isOptional = param.type()[param.type().length - 1] === '?'
    return dom.create('span')
      .class(isOptional ? 'qm-api-header-function-param qm-api-optional' : 'qm-api-header-function-param')
      .add(dom.create('span').class('qm-api-header-function-param-name').text(param.param(0)))
      .add(dom.create('span').class('qm-api-header-function-param-type').add(type(param.param(1), typeLinks)))
  })

  const returnsSelection = selection
    .selectAll('returns')
    .filter(sel => !sel.has('removed'))[0]

  const retns = returnsSelection ?
    dom.create('span')
      .class('qm-api-header-function-returns')
      .add(type(returnsSelection.ps(), typeLinks)) :
    undefined

  return dom.create('span')
    .class('qm-api-header-function')
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(name)
    .add(dom.create('span').class('qm-api-header-function-params').add(params))
    .add(retns)
}

/* A header that shows useful information for a prototype entry */
function prototypeHeaderDetails (selection, typeLinks) {
  let details = dom.create('span')
    .class('qm-api-header-prototype')
    .attr('id', selection.param(0) ? selection.param(0).toLowerCase() : undefined)
    .add(dom.create('span').class('qm-api-prototype-name').text(selection.param(0) || ''))

  const extendsEntities = selection.selectAll('extends')

  if (extendsEntities.length > 0) {
    details = details.add(dom.create('span').class('qm-api-prototype-extends').text('extends'))

    extendsEntities.forEach((ent) => {
      const extender = dom.create('span')
        .class('qm-api-prototype-extender')
        .add(type(ent.ps(), typeLinks))
      details = details.add(extender)
    })
  }

  return details
}

/* Wraps a details section in a header */
function createHeader (type, detailsBuilder, typeLinks) {
  return (selection, transformer) => {
    const details = detailsBuilder(selection, typeLinks)
    return header(type, details, selection, transformer)
  }
}

module.exports = {
  nameHeaderDetails: nameHeaderDetails,
  typeHeaderDetails: typeHeaderDetails,
  propertyHeaderDetails: propertyHeaderDetails,
  functionHeaderDetails: functionHeaderDetails,
  prototypeHeaderDetails: prototypeHeaderDetails,
  nameHeader: (options) => createHeader('name', nameHeaderDetails, {}),
  typeHeader: (options) => createHeader('type', typeHeaderDetails, (options || {}).typeLinks || {}),
  propertyHeader: (options) => createHeader('property', propertyHeaderDetails, (options || {}).typeLinks || {}),
  functionHeader: (options) => createHeader('function', functionHeaderDetails, (options || {}).typeLinks || {}),
  prototypeHeader: (options) => createHeader('prototype', prototypeHeaderDetails, (options || {}).typeLinks || {})
}

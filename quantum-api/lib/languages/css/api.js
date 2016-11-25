'use strict'

const header = require('../../entity-transforms/builders/header-builders')
const body = require('../../entity-transforms/builders/body-builders')
const itemBuilder = require('../../entity-transforms/builders/item-builder')

/* The config for building css api docs */
module.exports = (options) => {
  const nameHeader = header.nameHeader()

  const description = body.description()
  const extras = body.extras()
  const groups = body.groups()
  const classes = body.classes()
  const extraClasses = body.extraClasses()
  const childClasses = body.childClasses()

  return {
    class: itemBuilder({
      class: 'qm-api-class',
      header: nameHeader,
      content: [ description, extras, groups, classes, extraClasses, childClasses ]
    }),
    extraclass: itemBuilder({
      class: 'qm-api-extraclass',
      header: nameHeader,
      content: [ description, extras, groups, classes, extraClasses, childClasses ]
    }),
    childclass: itemBuilder({
      class: 'qm-api-childclass',
      header: nameHeader,
      content: [ description, extras, groups, classes, extraClasses, childClasses ]
    })
  }
}

'use strict'

const dom = require('quantum-dom')

const collapsible = require('../components/collapsible')
const noticeBuilder = require('./notice-builder')

const deprecatedNoticeBuilder = noticeBuilder('deprecated', 'Deprecated')
const removedNoticeBuilder = noticeBuilder('removed', 'Removed')

const standardBuilders = [deprecatedNoticeBuilder, removedNoticeBuilder]

module.exports = function itemBuilder (options) {
  // render as something else if the type parameter matches
  // (eg @property bob [Function] should be rendered as a function)
  const others = options.renderAsOther || {}
  const otherKeys = Object.keys(others)

  const builders = standardBuilders.concat(options.content || [])

  return (selection, transforms) => {
    const itemClass = selection.transformContext().class || options.class || ''

    for (let i = 0; i < otherKeys.length; i++) {
      const name = otherKeys[i]
      if (selection.param(1) === name) {
        selection.transformContext({class: itemClass})
        return others[name](selection, transforms)
      }
    }

    const content = dom.create('div')
      .class('qm-api-item-content')
      .add(builders.map(builder => builder(selection, transforms)))

    if (options.header) {
      const type = selection.type()
      const isOptional = type[type.length - 1] === '?'

      const header = dom.create('div')
        .class('qm-api-item-head')
        .classed('qm-api-optional', isOptional)
        .add(options.header(selection, transforms))

      return collapsible(itemClass, header, content)
    } else {
      return content
    }
  }
}

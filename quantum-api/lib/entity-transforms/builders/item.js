'use strict'

const dom = require('quantum-dom')

const collapsible = require('../components/collapsible')
const notice = require('./notice')

const addedNoticeBuilder = notice('added', 'Added')
const updatedNoticeBuilder = notice('updated', 'Updated')
const bugfixNoticeBuilder = notice('bugfix', 'Bug Fix')
const deprecatedNoticeBuilder = notice('deprecated', 'Deprecated')
const removedNoticeBuilder = notice('removed', 'Removed')

const standardBuilders = [
  addedNoticeBuilder,
  updatedNoticeBuilder,
  bugfixNoticeBuilder,
  deprecatedNoticeBuilder,
  removedNoticeBuilder
]

module.exports = function itemBuilder (options) {
  // render as something else if the type parameter matches
  // (eg @property bob [Function] should be rendered as a function)
  const others = options.renderAsOther || {}
  const otherKeys = Object.keys(others)

  const builders = standardBuilders.concat(options.content || [])

  return (selection, transformer) => {
    const itemClass = selection.transformContext().class || options.class || ''

    for (let i = 0; i < otherKeys.length; i++) {
      const name = otherKeys[i]
      if (selection.param(0) === name || selection.param(1) === name) {
        selection.transformContext({class: itemClass})
        return others[name](selection, transformer)
      }
    }

    const builtContent = builders.map(builder => builder(selection, transformer)).filter(x => x)

    const content = builtContent.length ? dom.create('div')
      .class('qm-api-item-content')
      .add(builtContent) : undefined

    if (options.header) {
      const type = selection.type()
      const isOptional = type[type.length - 1] === '?'
      const isCollapsible = selection.select('collapsible').ps() !== 'false'
      const isCollapsed = selection.select('collapsed').ps() !== 'false'

      const header = dom.create('div')
        .class('qm-api-item-head')
        .classed('qm-api-optional', isOptional)
        .add(options.header(selection, transformer))

      return collapsible(itemClass, header, content, isCollapsible, isCollapsed)
    } else {
      return content
    }
  }
}

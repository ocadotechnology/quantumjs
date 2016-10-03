'use strict'
const select = require('quantum-js').select
const Promise = require('bluebird')
const merge = require('merge')
const dom = require('quantum-dom')
const defaultConfig = require('./config.js')
const path = require('path')
const html = require('quantum-html')

function transforms (opts) {
  const options = merge.recursive(defaultConfig, opts)

  function entityIfExists (entity, selector, transformer) {
    if (entity.has(selector)) {
      const selection = entity.select(selector)
      if (selection.content().length || selection.params().length) {
        return transformer(entity.select(selector))
      }
    }
  }

  function paragraphEntity (newEntityClass, transforms) {
    return (selection) => {
      return dom.create('div')
        .class(newEntityClass)
        .add(html.paragraphTransform(selection, transforms))
    }
  }

  function defaultUrlLookup (selection) { return selection.ps() }

  function linkEntity (newEntityClass, text, urlLookup) {
    return (selection) => {
      const resolvedUrlLookup = urlLookup || defaultUrlLookup
      return dom.create('div')
        .class(newEntityClass)
        .attr('href', resolvedUrlLookup(selection))
        .add(text)
    }
  }

  function issue (entity, transforms) {
    return dom.create('a')
      .attr('href', options.issueUrl + entity.ps())
      .text('#' + entity.ps())
  }

  function entry (entity, transforms) {
    const type = options.tags[entity.type()]
    const icon = dom.create('i').class(type.iconClass + ' ' + (type.textClass || 'qm-changelog-text-' + entity.type()))

    const heading = entity.ps().length > 0 ? dom.create('div').class('qm-changelog-entry-head').add(entity.ps()) : undefined

    const description = entityIfExists(entity, 'description', paragraphEntity('qm-changelog-entry-description', transforms))

    if (options.issueUrl && entity.has('issue')) {
      let elem = heading || description

      entity.selectAll('issue').forEach((issueEntity, index) => {
        elem = elem
          .add(index > 0 ? ', ' : ': ')
          .add(issue(issueEntity, transforms))
      })
    }

    const extra = entityIfExists(entity, 'description', paragraphEntity('qm-changelog-entry-extra', transforms))

    const body = (description || extra) ? dom.create('div').class('qm-changelog-entry-body')
      .add(description)
      .add(extra) : undefined

    return dom.create('div').class('qm-changelog-entry')
      .add(dom.create('div').class('qm-changelog-entry-icon')
        .add(icon))
      .add(dom.create('div').class('qm-changelog-entry-content')
        .add(heading)
        .add(body))
  }

  function label (tagName, tag, count) {
    return dom.create('div').class('qm-changelog-label ' + (tag.tagClass || 'qm-changelog-background-' + tagName))
      .add(dom.create('i').class(tag.iconClass))
      .add(dom.create('span').text(count))
  }

  function createCollapsible (header, content) {
    return dom.create('div').class('qm-changelog-collapsible')
      .add(dom.create('div').class('qm-changelog-collapsible-heading')
        .add(dom.create('div').class('qm-changelog-collapsible-toggle')
          .add(dom.create('i').class('qm-changelog-chevron-icon')))
        .add(dom.create('div').class('qm-changelog-collapsible-head')
          .add(header)))
      .add(dom.create('div').class('qm-changelog-collapsible-content')
        .add(content))
  }

  function item (entity, transforms, singleItemMode) {
    const tags = Object.keys(options.tags).sort((a, b) => options.tags[a].order - options.tags[b].order)

    const link = entityIfExists(entity, 'link', linkEntity('qm-changelog-item-link', entity.ps()))

    const title = dom.create('div').class('qm-changelog-item-title')
      .add(link || entity.ps())

    const unprocessedEntries = entity.selectAll(tags)

    let entries = dom.create('div').class('qm-changelog-item-entries')

    unprocessedEntries.forEach((entryEntity) => {
      entries = entries.add(entry(select(entryEntity), transforms))
    })

    const description = entityIfExists(entity, 'description', paragraphEntity('qm-changelog-item-description', transforms))
    const extra = entityIfExists(entity, 'extra', paragraphEntity('qm-changelog-item-extra', transforms))

    if (singleItemMode) {
      return dom.create('div').class('qm-changelog-single-item')
        .add(description)
        .add(entries)
        .add(extra)
    } else {
      let labels = dom.create('div').class('qm-changelog-item-labels')
      tags.forEach((tagName) => {
        const count = unprocessedEntries.reduce((total, e) => e.type === tagName ? total + 1 : total, 0)
        if (count > 0) {
          labels = labels.add(label(tagName, options.tags[tagName], count))
        }
      })

      const header = dom.create('div').class('qm-changelog-item-head')
        .add(title)
        .add(labels)

      const content = dom.create('div').class('qm-changelog-item-body')
        .add(description)
        .add(entries)
        .add(extra)

      return dom.create('div').class('qm-changelog-item').add(createCollapsible(header, content))
    }
  }

  function changelog (entity, transforms) {
    const singleItem = entity.selectAll('item').length === 1
    const itemArr = entity.selectAll('item')
    const items = Promise.all(itemArr.map((itemEntity) => {
      return item(itemEntity, transforms, singleItem && itemEntity.has('renderSingleItemInRoot'))
    }))

    const description = entityIfExists(entity, 'description', paragraphEntity('qm-changelog-description', transforms))
    const extra = entityIfExists(entity, 'extra', paragraphEntity('qm-changelog-extra', transforms))

    const link = entityIfExists(entity, 'link', linkEntity('qm-changelog-item-link', entity.ps()))

    function milestoneUrlLookup (selection) {
      return options.milestoneUrl + selection.ps()
    }

    const milestone = entityIfExists(entity, 'milestone', linkEntity('qm-changelog-item-milestone', entity.ps()), milestoneUrlLookup)

    const title = link || milestone || entity.ps()

    // Only add a changelog if there is content to display
    if (itemArr.length > 0 || description || extra) {
      return dom.create('div').class('qm-changelog')
        .add(dom.asset({
          url: '/assets/quantum-changelog.css',
          file: path.join(__dirname, '/../assets/quantum-changelog.css')
        }))
        .add(dom.asset({
          url: '/assets/quantum-changelog.js',
          file: path.join(__dirname, '/../assets/quantum-changelog.js')
        }))
        .add(dom.create('div').class('qm-changelog-head').add(title))
        .add(dom.create('div').class('qm-changelog-body')
          .add(description)
          .add(items)
          .add(extra))
    }
  }

  function wrapper (entity, transforms) {
    return dom.create('div').class('qm-changelog-wrapper')
      .add(entity.transform(transforms))
  }

  function keyItem (name, tag) {
    return dom.create('div').class('qm-changelog-key-item')
      .add(dom.create('div').class('qm-changelog-key-item-icon')
        .add(dom.create('i').class(tag.iconClass + ' ' + (tag.textClass || 'qm-changelog-text-' + name))))
      .add(dom.create('div').class('qm-changelog-key-item-text')
        .add(tag.keyText))
  }

  function key (entity, transforms) {
    let keys = dom.create('div').class('qm-changelog-keys')

    Object.keys(options.tags).forEach((tag) => {
      keys = keys.add(keyItem(dom, tag, options.tags[tag]))
    })

    return dom.create('div').class('qm-changelog-key')
      .add(keys)
  }

  return Object.freeze({
    key,
    changelog,
    wrapper
  })
}

module.exports = transforms

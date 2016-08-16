const select = require('quantum-js').select
const Promise = require('bluebird')
const flatten = require('flatten')
const merge = require('merge')
const dom = require('quantum-dom')
const defaultConfig = require('./config.js')

module.exports = function (opts) {
  const options = merge.recursive(defaultConfig, opts)

  function issue (entity, transforms) {
    return dom.create('a')
      .attr('href', options.issueUrl + entity.ps())
      .text('#' + entity.ps())
  }

  function entry (entity, transforms) {
    const type = options.tags[entity.type()]
    const icon = dom.create('i').class(type.iconClass + ' ' + (type.textClass || 'qm-changelog-text-' + entity.type()))

    const heading = entity.ps().length > 0 ? dom.create('div').class('qm-changelog-entry-head').add(entity.ps()) : undefined

    const hasDescription = entity.has('description') && entity.select('description').content.length
    const description = hasDescription ? dom.create('div').class('qm-changelog-entry-description').add(entity.select('description').transform(transforms)) : undefined

    if (options.issueUrl && entity.has('issue')) {
      let elem = (heading ? heading : description)

      entity.selectAll('issue').forEach(function (issueEntity, index) {
        elem = elem
          .add(index > 0 ? ', ' : ': ')
          .add(issue(issueEntity, transforms))
      })
    }

    if (entity.has('extra')) {
      var extra = dom.create('div').class('qm-changelog-entry-extra').add(entity.select('extra').transform(transforms))
    }

    if (description || extra) {
      var body = dom.create('div').class('qm-changelog-entry-body')
        .add(description)
        .add(extra)
    }

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
    var id = dom.randomId()
    var tags = Object.keys(options.tags).sort(function (a, b) {
      return order = options.tags[a].order - options.tags[b].order
    })

    var title = dom.create('div').class('qm-changelog-item-title')

    if (entity.has('link')) {
      title = title.add(dom.create('a').class('qm-changelog-item-link')
        .attr('href', entity.select('link').ps())
        .add(entity.ps()))
    } else {
      title = title.add(entity.ps())
    }

    var unprocessedEntries = entity.selectAll(tags)

    var entries = dom.create('div').class('qm-changelog-item-entries')

    unprocessedEntries.forEach(function (entryEntity) {
      entries = entries.add(entry(select(entryEntity), transforms))
    })

    if (entity.has('description')) {
      var description = dom.create('div').class('qm-changelog-item-description').add(entity.select('description').transform(transforms))
    }

    if (entity.has('extra')) {
      var extra = dom.create('div').class('qm-changelog-item-extra').add(entity.select('extra').transform(transforms))
    }

    if (singleItemMode) {
      return dom.create('div').class('qm-changelog-single-item')
        .add(description)
        .add(entries)
        .add(extra)
    } else {
      var labels = dom.create('div').class('qm-changelog-item-labels')
      tags.forEach(function (tagName) {
        var count = unprocessedEntries.reduce(function (total, e) { return e.type == tagName ? total + 1 : total }, 0)
        if (count > 0) {
          labels = labels.add(label(tagName, options.tags[tagName], count))
        }
      })

      var header = dom.create('div').class('qm-changelog-item-head')
        .add(title)
        .add(labels)
      var content = dom.create('div').class('qm-changelog-item-body')
        .add(description)
        .add(entries)
        .add(extra)

      return dom.create('div').class('qm-changelog-item').add(createCollapsible(header, content))
    }
  }

  function changelog (entity, transforms) {
    var singleItem = entity.selectAll('item').length === 1
    var itemArr = entity.selectAll('item')
    var items = Promise.all(itemArr.map(function (itemEntity) {
      return item(itemEntity, transforms, singleItem && itemEntity.has('renderSingleItemInRoot'))
    }))

    if (entity.has('description')) {
      var description = dom.create('div').class('qm-changelog-description').add(entity.select('description').transform(transforms))
    }

    if (entity.has('link')) {
      var link = entity.select('link')
      var title = dom.create('a').class('qm-changelog-link').attr('href', link.ps()).text(entity.ps())
    } else if (entity.has('milestone')) {
      var milestone = entity.select('milestone')
      title = dom.create('a').class('qm-changelog-link').attr('href', options.milestoneUrl + milestone.ps()).text(entity.ps())
    } else {
      var title = entity.ps()
    }

    if (entity.has('extra')) {
      var extra = dom.create('div').class('qm-changelog-extra').add(entity.select('extra').transform(transforms))
    }

    // Only add a changelog if there is content to display
    if (itemArr.length > 0 || description || extra) {
      return dom.create('div').class('qm-changelog')
        .add(dom.asset({url: '/assets/quantum-changelog.css', file: __dirname + '/../assets/quantum-changelog.css'}))
        .add(dom.asset({url: '/assets/quantum-changelog.js', file: __dirname + '/../assets/quantum-changelog.js'}))
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
    var keys = dom.create('div').class('qm-changelog-keys')

    Object.keys(options.tags).map(function (tag) {
      keys = keys.add(keyItem(dom, tag, options.tags[tag]))
    })
    return dom.create('div').class('qm-changelog-key')
      .add(keys)
  }

  return {
    'key': key,
    'changelog': changelog,
    'wrapper': wrapper
  }
}

var select = require('quantum-js').select
var dom = require('quantum-dom')
var html = require('quantum-html')
var Promise = require('bluebird')
var flatten = require('flatten')

/* Example:

  @changelog
    @process
      @inline

    @version 0.1.0
      @link:
      @description:

  @changelog 0.1.0
    @link(url)[Item Link]

    @description: Item description

    @extra
          @api
            @prototype thing
              @description: A thing

    @item Item Name
      @link(url)[Item Link]

      @description: Item description
      @extra
        @api
          @prototype thing
            @description: A thing

      @added [Added thing]
        @description: Added thing description
        @issue 500
        @extra
          @api
            @prototype thing
              @description: A thing

      @deprecated [Deprecated thing]
        @description: Deprecated thing description
        @alternative: Deprecated thing alternative thing

    @item Item Name
      @link(url)[Item Link 1]
      @link(url)[Item Link 2]

      @extra: Extra suff for item

      @added [Added thing]:
        @description: Added thing description
        @issue 500
        @issue 501
        @issue 502
        @issue 503
        @extra: Extra stuff for Added thing

      @deprecated [Deprecated thing]
        @description: Deprecated thing description
        @alternative: Deprecated thing alternative thing

      @removed [Removed thing]
        @description: This thing was removed
*/

module.exports = function (options) {
  function issue (entity, page, transforms) {
    return page.create('a')
      .attr('href', options.issueUrl + entity.ps())
      .text('#' + entity.ps())
  }

  function entry (entity, page, transforms) {
    var type = options.tags[entity.type]
    var icon = page.create('i').class(type.iconClass + ' ' + (type.textClass || 'qm-changelog-text-' + entity.type))

    if (entity.ps().length > 0) {
      var heading = page.create('div').class('qm-changelog-entry-head').add(entity.ps())
    }

    if (entity.has('description')) {
      if (entity.select('description').content.length) {
        var description = page.create('div').class('qm-changelog-entry-description').add(entity.select('description').transform(transforms))
      }
    }

    if (!!options.issueUrl && entity.has('issue')) {
      var elem = (heading ? heading : description)

      entity.selectAll('issue').forEach(function (issueEntity, index) {
        elem = elem
          .add(index > 0 ? ', ' : ': ')
          .add(issue(issueEntity, page, transforms))
      })
    }

    if (entity.has('extra')) {
      var extra = page.create('div').class('qm-changelog-entry-extra').add(entity.select('extra').transform(transforms))
    }

    if (description || extra) {
      var body = page.create('div').class('qm-changelog-entry-body')
        .add(description)
        .add(extra)
    }

    return page.create('div').class('qm-changelog-entry')
      .add(page.create('div').class('qm-changelog-entry-icon')
        .add(icon))
      .add(page.create('div').class('qm-changelog-entry-content')
        .add(heading)
        .add(body))
  }

  function label (page, tagName, tag, count) {
    return page.create('div').class('qm-changelog-label ' + (tag.tagClass || 'qm-changelog-background-' + tagName))
      .add(page.create('i').class(tag.iconClass))
      .add(page.create('span').text(count))
  }

  var whiteChevron = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10" height="14" viewBox="0 0 10 14"><path fill="#FFFFFF" d="M8.648 6.852l-5.797 5.797q-0.148 0.148-0.352 0.148t-0.352-0.148l-1.297-1.297q-0.148-0.148-0.148-0.352t0.148-0.352l4.148-4.148-4.148-4.148q-0.148-0.148-0.148-0.352t0.148-0.352l1.297-1.297q0.148-0.148 0.352-0.148t0.352 0.148l5.797 5.797q0.148 0.148 0.148 0.352t-0.148 0.352z"></path></svg>'

  function createCollapsible (page, header, content) {
    return page.create('div').class('qm-changelog-collapsible')
      .add(page.create('div').class('qm-changelog-collapsible-heading')
        .add(page.create('div').class('qm-changelog-collapsible-toggle').text(whiteChevron, true))
        .add(page.create('div').class('qm-changelog-collapsible-head')
          .add(header)))
      .add(page.create('div').class('qm-changelog-collapsible-content')
        .add(content))
  }

  function item (entity, page, transforms, singleItemMode) {
    var id = page.nextId()
    var tags = Object.keys(options.tags).sort(function (a, b) {
      return order = options.tags[a].order - options.tags[b].order
    })

    var title = page.create('div').class('qm-changelog-item-title')

    if (entity.has('link')) {
      title = title.add(page.create('a').class('qm-changelog-item-link')
        .attr('href', entity.select('link').ps())
        .add(entity.ps()))
    } else {
      title = title.add(entity.ps())
    }

    var unprocessedEntries = entity.selectAll(tags)

    var entries = page.create('div').class('qm-changelog-item-entries')

    unprocessedEntries.forEach(function (entryEntity) {
      entries = entries.add(entry(select(entryEntity), page, transforms))
    })

    if (entity.has('description')) {
      var description = page.create('div').class('qm-changelog-item-description').add(entity.select('description').transform(transforms))
    }

    if (entity.has('extra')) {
      var extra = page.create('div').class('qm-changelog-item-extra').add(entity.select('extra').transform(transforms))
    }

    if (singleItemMode) {
      return page.create('div').class('qm-changelog-single-item')
        .add(description)
        .add(entries)
        .add(extra)
    } else {
      var labels = page.create('div').class('qm-changelog-item-labels')
      tags.forEach(function (tagName) {
        var count = unprocessedEntries.reduce(function (total, e) { return e.type == tagName ? total + 1 : total }, 0)
        if (count > 0) {
          labels = labels.add(label(page, tagName, options.tags[tagName], count))
        }
      })

      var header = page.create('div').class('qm-changelog-item-head')
        .add(title)
        .add(labels)
      var content = page.create('div').class('qm-changelog-item-body')
        .add(description)
        .add(entries)
        .add(extra)

      return page.create('div').class('qm-changelog-item').add(createCollapsible(page, header, content))
    }
  }

  function changelog (entity, page, transforms) {
    var singleItem = entity.selectAll('item').length === 1
    var itemArr = entity.selectAll('item')
    var items = Promise.all(itemArr.map(function (itemEntity) {
      return item(itemEntity, page, transforms, singleItem && itemEntity.has('renderSingleItemInRoot'))
    }))

    if (entity.has('description')) {
      var description = page.create('div').class('qm-changelog-description').add(entity.select('description').transform(transforms))
    }

    if (entity.has('link')) {
      var link = entity.select('link')
      var title = page.create('a').class('qm-changelog-link').attr('href', link.ps()).text(entity.ps())
    } else if (entity.has('milestone')) {
      var milestone = entity.select('milestone')
      title = page.create('a').class('qm-changelog-link').attr('href', options.milestoneUrl + milestone.ps()).text(entity.ps())
    } else {
      var title = entity.ps()
    }

    if (entity.has('extra')) {
      var extra = page.create('div').class('qm-changelog-extra').add(entity.select('extra').transform(transforms))
    }

    return page.addAssets({
      css: {
        'changelog.css': __dirname + '/client/quantum-changelog.css'
      },
      js: {
        'changelog.js': __dirname + '/client/quantum-changelog.js'
      }
    })
      .then(function () {
        // Only add a changelog if there is content to display
        if (itemArr.length > 0 || description || extra) {
          return page.create('div').class('qm-changelog')
            .add(page.create('div').class('qm-changelog-head').add(title))
            .add(page.create('div').class('qm-changelog-body')
              .add(description)
              .add(items)
              .add(extra))
        }
      })
  }

  function wrapper (entity, page, transforms) {
    return page.create('div').class('qm-changelog-wrapper')
      .add(entity.transform(transforms))
  }

  function keyItem (page, name, tag) {
    return page.create('div').class('qm-changelog-key-item')
      .add(page.create('div').class('qm-changelog-key-item-icon')
        .add(page.create('i').class(tag.iconClass + ' ' + (tag.textClass || 'qm-changelog-text-' + name))))
      .add(page.create('div').class('qm-changelog-key-item-text')
        .add(tag.keyText))
  }

  function key (entity, page, transforms) {
    var keys = page.create('div').class('qm-changelog-keys')

    Object.keys(options.tags).map(function (tag) {
      keys = keys.add(keyItem(page, tag, options.tags[tag]))
    })
    return page.create('div').class('qm-changelog-key')
      .add(keys)
  }

  return {
    'key': key,
    'changelog': changelog,
    'wrapper': wrapper
  }
}

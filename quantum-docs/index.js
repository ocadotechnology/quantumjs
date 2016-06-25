var quantum = require('quantum-js')
var paragraphTransform = require('quantum-html').paragraphTransform

function toContextClass (context) {
  return context ? 'qm-docs-' + context : ''
}

function spinalCase (string) {
  return string.toLowerCase().split(' ').join('-')
}

var transforms = {}

transforms.topic = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-topic')
    .add(page.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
      .add(page.create('div').class('qm-docs-topic-header')
        .text(selection.ps())
        .add(page.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
    .add(page.create('div').class('qm-docs-topic-body').add(paragraphTransform(selection, page, transforms)))
}

transforms.section = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-section')
    .add(page.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
      .add(page.create('div').class('qm-docs-section-header')
        .text(selection.ps())
        .add(page.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
    .add(page.create('div').class('qm-docs-section-body').add(paragraphTransform(selection, page, transforms)))
}

transforms.subsection = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-subsection')
    .add(page.create('div').class('qm-docs-subsection-header').text(selection.ps()))
    .add(page.create('div').class('qm-docs-subsection-body').add(paragraphTransform(selection, page, transforms)))
}

transforms.notice = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-notice ' + toContextClass(selection.param(1)))
    .add(page.create('div').class('qm-docs-notice-header').text(selection.param(0) || ''))
    .add(page.create('div').class('qm-docs-notice-body').add(paragraphTransform(selection, page, transforms)))
}

transforms.list = function (selection, page, transforms) {
  var ordered = selection.ps() === 'ordered'
  return page.create(ordered ? 'ol' : 'ul').class(ordered ? 'qm-docs-list' : 'qm-docs-list fa-ul')
    .add(page.all(selection.selectAll('item').map(function (e) {
      return page.create('li')
        .add(ordered ? undefined : e.ps() ? page.create('i').class('fa fa-li ' + e.ps()) : undefined)
        .add(paragraphTransform(e, page, transforms))
    })))
}

transforms.bold = function (selection, page, transforms) {
  return page.create('b').add(selection.transform(transforms))
}

transforms.italic = function (selection, page, transforms) {
  return page.create('i').add(selection.transform(transforms))
}

transforms.strikethrough = function (selection, page, transforms) {
  return page.create('del').add(selection.transform(transforms))
}

transforms.image = function (selection, page, transforms) {
  return page.create('img')
    .attr('src', selection.ps())
    .attr('alt', selection.cs())
    .attr('title', selection.cs())
}

transforms.summary = function (selection, page, transforms) {
  var element = page.create('div').class('qm-docs-summary')
    .add(page.create('div').text(selection.ps()).class('qm-docs-summary-header'))
    .add(page.create('div').class('qm-docs-summary-body').add(selection.select('description').transform(transforms)))

  if (selection.has('link')) {
    selection.selectAll('link').forEach(function (link) {
      element.add(page.create('a').class('qm-docs-summary-link').attr('href', link.ps())
        .add(page.create('span').text(link.cs()))
        .add(page.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon')))
    })
  }

  return element
}

transforms.sheet = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-sheet').add(paragraphTransform(selection, page, transforms))
}

transforms.group = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-group').add(selection.transform(transforms))
}

transforms.versionSelector = function (selection, page, transforms) {
  var current = selection.select('versionList').select('current').ps()
  var versions = selection.select('versionList').selectAll('version').map(function (e) {
    return e.ps()
  })

  if (versions.length > 0) {
    var id = page.nextId()

    // XXX: make this configurable (it should be a function with no external dependencies that can run in browsers)
    var redirectorFunction = function (url, current, version) {
      if (hx.endsWith(url, current + '/')) {
        return '../' + version + '/'
      } else {
        return version + '/'
      }
    }

    var script = [
      'var redirectorFunction = ' + redirectorFunction.toString() + ';',
      'new hx.Menu("#' + id + '", {items: ' + JSON.stringify(versions) + ', renderer: function(e, v) {hx.select(e).append("a").attr("href", redirectorFunction(window.location.pathname, "' + current + '", v)).text(v)}})',
    ].join('\n')

    page.body.add(page.create('script').text(script, {escape: false}), true)

    return page.create('button').id(id).class('qm-docs-version-selector hx-btn')
      .add(page.create('span').text(current + ' '))
      .add(page.create('i').class('fa fa-caret-down'))
  }
}

transforms.sidebar = function (selection, page, transforms) {
  page.body.classed('qm-docs-sidebar-page', true)
  return page.create('div').class('qm-docs-sidebar ' + (selection.ps() === 'right' ? 'qm-docs-sidebar-right' : 'qm-docs-sidebar-left'))
    .add(selection.transform(transforms))
}

transforms.tableOfContents = function (selection, page, transforms) {
  var toc = page.create('div').class('qm-docs-table-of-contents')

  var tocContainer = page.create('ul').class('qm-docs-table-of-contents-container')

  if (selection.ps()) {
    toc.add(page.create('h1').text(selection.ps()))
  }
  toc.add(tocContainer)

  selection.selectAll('topic', {recursive: true}).forEach(function (topic) {
    var sections = topic.selectAll('section').map(function (section) {
      return page.create('li').add(page.create('a')
        .class('qm-docs-table-of-contents-section')
        .attr('href', '#' + spinalCase(section.ps()))
        .text(section.ps()))
    })

    tocContainer.add(page.create('li').class('qm-docs-table-of-contents-topic-container')
      .add(page.create('a').class('qm-docs-table-of-contents-topic').attr('href', '#' + spinalCase(topic.ps())).text(topic.ps()))
      .add(page.create('ul').add(sections)))
  })

  return toc
}

transforms.navigationMenu = function (selection, page, transforms) {
  var sections = selection.selectAll('section').map(function (sectionEntity) {
    var pages = sectionEntity.selectAll('page').map(function (pageEntity) {
      return page.create('a').class('qm-docs-navication-menu-page')
        .attr('href', pageEntity.ps())
        .text(pageEntity.cs())
    })

    return page.create('div').class('qm-docs-navication-menu-section')
      .add(page.create('div').class('qm-docs-navication-menu-section-title').text(sectionEntity.ps()))
      .add(page.create('div').class('qm-docs-navication-menu-section-body').add(pages))
  })

  return page.create('div').class('qm-docs-navication-menu').add(sections)
}

transforms.header = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-header')
    .add(page.create('div').class('qm-docs-centered')
      .add(page.create('div').class('qm-docs-header-wrapper')
        .add(page.create('div').class('qm-docs-header-title').text(selection.select('title').ps()))
        .add(selection.selectAll('link').map(function (e) {
          return page.create('a')
            .class('qm-docs-header-link')
            .attr('href', e.ps())
            .text(e.cs())
        }))
    ))
}

transforms.topSection = function (selection, page, transforms) {
  var pageTitle = selection.select('title').ps()
  if (pageTitle.length) {
    page.remove('title')
    page.head.add(page.create('title', 'title').text(pageTitle))
  }

  return page.create('div').class('qm-docs-top-section')
    .add(breadcrumb(selection.select('breadcrumb'), page, transforms))
    .add(page.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
      .add(page.create('div').class('qm-docs-top-section-title').text(pageTitle))
      .add(page.create('div').class('qm-docs-top-section-description')
        .add(paragraphTransform(selection.select('description'), page, transforms))))
}

function breadcrumb (selection, page, transforms) {
  if (selection.selectAll('item').length === 0) return undefined

  var element = page.create('div').class('qm-docs-breadcrumb')
  var container = page.create('div').class('qm-docs-top-section-centered qm-docs-breadcrumb-padding')

  selection.selectAll('item').forEach(function (item, i) {
    if (i > 0) container.add(page.create('i').class('fa fa-angle-right qm-docs-breadcrumb-arrow-icon'))
    container.add(page.create('a').attr('href', item.ps()).class('qm-docs-breadcrumb-section').text(item.cs()))
  })

  return element.add(container)
}

transforms.breadcrumb = breadcrumb

transforms.contentSection = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-content-section-container')
    .add(selection.filter('sidebar').transform(transforms))
    .add(page.create('div').class('qm-docs-content-section')
      .add(page.create('div').class('qm-docs-centered')
        .add(selection.filter(function (selection) {
          return !quantum.select.isSelection(selection) || selection.type() !== 'sidebar'
        }).transform(transforms))))
}

transforms.bottomSection = function (selection, page, transforms) {
  return page.create('div').class('qm-docs-bottom-section')
    .add(selection.transform(transforms))
}

transforms.relatedButtons = function (selection, page, transforms) {
  var buttons = selection.selectAll('button').map(function (e) {
    return page.create('a')
      .attr('href', e.ps())
      .class('qm-docs-related-button')
      .add(page.create('div')
        .add(page.create('div').class('qm-docs-related-button-title').text(e.select('title').cs()))
        .add(page.create('div').class('qm-docs-related-button-description').text(e.select('description').cs())))
  })

  return page.create('div').class('qm-docs-related-buttons')
    .add(buttons)

}

transforms.table = function (selection, page, transforms) {
  function toRow (rowEntity) {
    var isHeader = rowEntity.type === 'header'

    var cells = Promise.all(rowEntity.selectAll('cell').map(function (cellEntity) {
      return paragraphTransform(cellEntity, page, transforms)
    })).then(function (cells) {
      return cells.map(function (cell) {
        return page.create(isHeader ? 'th' : 'td').add(cell)
      })
    })

    return page.create('tr').add(cells)
  }

  return Promise.all(selection.selectAll(['header', 'row']).map(toRow)).then(function (rows) {
    return page.create('table').class('qm-docs-table').add(rows)
  })
}

function assetify (trans) {
  var newTransforms = {}
  Object.keys(trans).forEach(function (k) {
    newTransforms[k] = function (selection, page, transforms) {
      page.asset('quantum-docs.css', __dirname + '/client/quantum-docs.css')
      page.asset('quantum-docs.js', __dirname + '/client/quantum-docs.js')
      return trans[k](selection, page, transforms)
    }
  })
  return newTransforms
}

module.exports = function (options) {
  return assetify(transforms)
}

module.exports.populateTableOfContents = function (opts) {
  return function (obj) {
    var toc = quantum.select(obj.content).select('tableOfContents', {recursive: true})
    var topics = quantum.select(obj.content).selectAll('topic', {recursive: true})

    topics.forEach(function (topic) {
      toc.add({
        type: 'topic',
        params: topic.params().slice(0),
        content: topic.selectAll('section').map(function (section) {
          return {
            type: 'section',
            params: section.params().slice(0),
            content: []
          }
        })
      })
    })

    return obj
  }
}

module.exports.assets = {
  'quantum-docs.css': __dirname + '/client/quantum-docs.css',
  'quantum-docs.js': __dirname + '/client/quantum-docs.js'
}

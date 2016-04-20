var quantum = require('quantum-js')
var paragraphTransform = require('quantum-html').paragraphTransform

function toContextClass (context) {
  return context ? 'qm-docs-' + context : ''
}

function spinalCase (string) {
  return string.toLowerCase().split(' ').join('-')
}

var transforms = {}

transforms.topic = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-topic')
    .add(page.create('div').class('qm-docs-anchor').id(spinalCase(entity.ps()))
      .add(page.create('div').class('qm-docs-topic-header')
        .text(entity.ps())
        .add(page.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(entity.ps())))))
    .add(page.create('div').class('qm-docs-topic-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.section = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-section')
    .add(page.create('div').class('qm-docs-anchor').id(spinalCase(entity.ps()))
      .add(page.create('div').class('qm-docs-section-header')
        .text(entity.ps())
        .add(page.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(entity.ps())))))
    .add(page.create('div').class('qm-docs-section-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.subsection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-subsection')
    .add(page.create('div').class('qm-docs-subsection-header').text(entity.ps()))
    .add(page.create('div').class('qm-docs-subsection-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.notice = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-notice ' + toContextClass(entity.params[1]))
    .add(page.create('div').class('qm-docs-notice-header').text(entity.params[0] || ''))
    .add(page.create('div').class('qm-docs-notice-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.list = function (entity, page, transforms) {
  var ordered = entity.ps() === 'ordered'
  return page.create(ordered ? 'ol' : 'ul').class(ordered ? 'qm-docs-list' : 'qm-docs-list fa-ul')
    .add(page.all(entity.selectAll('item').map(function (e) {
      return page.create('li')
        .add(ordered ? undefined : page.create('i').class('fa fa-li ' + (e.ps() || 'qm-docs-list-bullet fa-circle')))
        .add(paragraphTransform(e, page, transforms))
    })))
}

transforms.bold = function (entity, page, transforms) {
  return page.create('b').add(entity.transform(transforms))
}

transforms.italic = function (entity, page, transforms) {
  return page.create('i').add(entity.transform(transforms))
}

transforms.strikethrough = function (entity, page, transforms) {
  return page.create('del').add(entity.transform(transforms))
}

transforms.image = function (entity, page, transforms) {
  return page.create('img')
    .attr('src', entity.ps())
    .attr('alt', entity.cs())
    .attr('title', entity.cs())
}

transforms.summary = function (entity, page, transforms) {
  var element = page.create('div').class('qm-docs-summary')
    .add(page.create('div').text(entity.ps()).class('qm-docs-summary-header'))
    .add(page.create('div').class('qm-docs-summary-body').add(entity.select('description').transform(transforms)))

  if (entity.has('link')) {
    entity.selectAll('link').forEach(function (link) {
      element.add(page.create('a').class('qm-docs-summary-link').attr('href', link.ps())
        .add(page.create('span').text(link.cs()))
        .add(page.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon')))
    })
  }

  return element
}

transforms.sheet = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-sheet').add(paragraphTransform(entity, page, transforms))
}

transforms.group = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-group').add(entity.transform(transforms))
}

transforms.versionSelector = function (entity, page, transforms) {
  var current = entity.select('versionList').select('current').ps()
  var versions = entity.select('versionList').selectAll('version').map(function (e) {
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

transforms.sidebar = function (entity, page, transforms) {
  page.body.classed('qm-docs-sidebar-page', true)
  return page.create('div').class('qm-docs-sidebar ' + (entity.ps() === 'right' ? 'qm-docs-sidebar-right' : 'qm-docs-sidebar-left'))
    .add(entity.transform(transforms))
}

transforms.tableOfContents = function (entity, page, transforms) {
  var toc = page.create('div').class('qm-docs-table-of-contents')

  var tocContainer = page.create('ul').class('qm-docs-table-of-contents-container')

  if (entity.ps()) {
    toc.add(page.create('h1').text(entity.ps()))
  }
  toc.add(tocContainer)

  entity.selectAll('topic', {recursive: true}).forEach(function (topic) {
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

transforms.navigationMenu = function (entity, page, transforms) {
  var sections = entity.selectAll('section').map(function (sectionEntity) {
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

transforms.header = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-header')
    .add(page.create('div').class('qm-docs-centered')
      .add(page.create('div').class('qm-docs-header-wrapper')
        .add(page.create('div').class('qm-docs-header-title').text(entity.select('title').ps()))
        .add(entity.selectAll('link').map(function (e) {
          return page.create('a')
            .class('qm-docs-header-link')
            .attr('href', e.ps())
            .text(e.cs())
        }))
    ))
}

transforms.topSection = function (entity, page, transforms) {
  var pageTitle = entity.select('title').ps()
  if (pageTitle.length) {
    page.remove('title')
    page.head.add(page.create('title', 'title').text(pageTitle))
  }

  return page.create('div').class('qm-docs-top-section')
    .add(breadcrumb(entity.select('breadcrumb'), page, transforms))
    .add(page.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
      .add(page.create('div').class('qm-docs-top-section-title').text(pageTitle))
      .add(page.create('div').class('qm-docs-top-section-description')
        .add(paragraphTransform(entity.select('description'), page, transforms))))
}

function breadcrumb (entity, page, transforms) {
  if (entity.selectAll('item').length === 0) return undefined

  var element = page.create('div').class('qm-docs-breadcrumb')
  var container = page.create('div').class('qm-docs-top-section-centered qm-docs-breadcrumb-padding')

  entity.selectAll('item').forEach(function (item, i) {
    if (i > 0) container.add(page.create('i').class('fa fa-angle-right qm-docs-breadcrumb-arrow-icon'))
    container.add(page.create('a').attr('href', item.ps()).class('qm-docs-breadcrumb-section').text(item.cs()))
  })

  return element.add(container)
}

transforms.breadcrumb = breadcrumb

transforms.contentSection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-content-section-container')
    .add(entity.filter('sidebar').transform(transforms))
    .add(page.create('div').class('qm-docs-content-section')
      .add(page.create('div').class('qm-docs-centered')
        .add(entity.filter(function (entity) {return entity.type !== 'sidebar'}).transform(transforms))))
}

transforms.bottomSection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-bottom-section')
    .add(entity.transform(transforms))
}

transforms.relatedButtons = function (entity, page, transforms) {
  var buttons = entity.selectAll('button').map(function (e) {
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

transforms.table = function (entity, page, transforms) {
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

  return Promise.all(entity.selectAll(['header', 'row']).map(toRow)).then(function (rows) {
    return page.create('table').class('qm-docs-table').add(rows)
  })
}

function assetify (trans) {
  var newTransforms = {}
  Object.keys(trans).forEach(function (k) {
    newTransforms[k] = function (entity, page, transforms) {
      page.asset('quantum-docs.css', __dirname + '/client/quantum-docs.css')
      page.asset('quantum-docs.js', __dirname + '/client/quantum-docs.js')
      return trans[k](entity, page, transforms)
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
      var top = quantum.create('topic').ps(topic.ps())
      var sections = topic.selectAll('section').forEach(function (section) {
        top.add(quantum.create('section').ps(section.ps()))
      })
      toc.content.push(top)
    })

    return obj
  }
}

module.exports.assets = {
  'quantum-docs.css': __dirname + '/client/quantum-docs.css',
  'quantum-docs.js': __dirname + '/client/quantum-docs.js'
}

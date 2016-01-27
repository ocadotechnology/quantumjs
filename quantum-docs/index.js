var quantum = require('quantum-js')
var paragraphTransform = require('quantum-html').paragraphTransform

function toContextClass (context) {
  return context ? 'hx-background-' + context : ''
}

function spinalCase (string) {
  return string.toLowerCase().split(' ').join('-')
}

var transforms = {}

transforms.topic = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-topic')
    .add(page.create('div').class('qm-docs-anchor').id(spinalCase(entity.ps()))
      .add(page.create('div').class('qm-docs-topic-header').text(entity.ps())))
    .add(page.create('div').class('qm-docs-topic-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.section = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-section')
    .add(page.create('div').class('qm-docs-anchor').id(spinalCase(entity.ps()))
      .add(page.create('div').class('qm-docs-section-header').text(entity.ps())))
    .add(page.create('div').class('qm-docs-section-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.subsection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-subsection')
    .add(page.create('div').class('qm-docs-subsection-header').text(entity.ps()))
    .add(page.create('div').class('qm-docs-subsection-body').add(paragraphTransform(entity, page, transforms)))
}

transforms.notice = function (entity, page, transforms) {
  return page.create('div').class('hx-card')
    .add(page.create('div').class('hx-card-section hx-card-header hx-card-small ' + toContextClass(entity.params[1])).text(entity.params[0] || ''))
    .add(page.create('div').class('hx-card-section').add(entity.transform(transforms)))
}

transforms.list = function (entity, page, transforms) {
  var ordered = entity.ps() === 'ordered'
  return page.create(ordered ? 'ol' : 'ul').class(ordered ? 'qm-docs-list' : 'qm-docs-list fa-ul')
    .add(page.all(entity.selectAll('item').map(function (e) {
      return page.create('li')
        .add(ordered ? undefined : page.create('i').class('fa fa-li ' + (e.ps() || 'qm-docs-list-bullet fa-circle')))
        .add(e.transform(transforms))
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
  return page.create('img').attr('src', entity.ps()).attr('alt', entity.cs())
}

transforms.title = function (entity, page, transforms) {
  var subtitle = page.get('qm-docs-subtitle')
  if (subtitle) {
    subtitle.text(entity.ps())
  }
  page.head.add(page.create('title').text(entity.ps()))
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

transforms.tableOfContents = function (entity, page, transforms) {
  var tableOfContents = page.create('div').class('qm-docs-table-of-contents')

  entity.selectAll('topic').forEach(function (topic) {
    tableOfContents.add(
      page.create('div').class('qm-docs-table-of-contents-topic').add(
        page.create('a').attr('href', '#' + spinalCase(topic.ps())).text(topic.ps())))

    topic.selectAll('section').forEach(function (section) {
      tableOfContents.add(
        page.create('div').class('qm-docs-table-of-contents-section').add(
          page.create('a').attr('href', '#' + spinalCase(section.ps())).text(section.ps())))
    })
  })

  page.body.append(tableOfContents)
}

transforms.topSection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-top-section')
    .add(breadcrumb(entity.select('breadcrumb'), page, transforms))
    .add(page.create('div').class('qm-docs-centered')
      .add(page.create('div').class('qm-docs-top-section-title').text(entity.select('title').ps()))
      .add(page.create('div').class('qm-docs-top-section-description')
        .add(paragraphTransform(entity.select('description'), page, transforms))))
}

function breadcrumb (entity, page, transforms) {
  var element = page.create('div').class('qm-docs-breadcrumb')
  var container = page.create('div').class('qm-docs-centered qm-docs-breadcrumb-padding')

  entity.selectAll('item').forEach(function (item, i) {
    if (i > 0) container.add(page.create('i').class('fa fa-angle-right qm-docs-breadcrumb-arrow-icon'))
    container.add(page.create('a').attr('href', item.ps()).class('qm-docs-breadcrumb-section').text(item.cs()))
  })

  return element.add(container)
}

transforms.breadcrumb = breadcrumb

transforms.contentSection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-content-section')
    .add(page.create('div').class('qm-docs-centered')
      .add(entity.transform(transforms)))
}

transforms.bottomSection = function (entity, page, transforms) {
  return page.create('div').class('qm-docs-bottom-section')
    .add(entity.transform(transforms))
}

transforms.paginationButtons = function (entity, page, transforms) {
  var prevButton = undefined
  var nextButton = undefined

  if (entity.has('previous')) {
    previous = entity.select('previous')
    prevButton = page.create('a')
      .attr('href', previous.ps())
      .class('qm-docs-pagination-button qm-docs-pagination-button-prev')
      .add(page.create('div')
        .add(page.create('i').class('qm-docs-pagination-button-arrow fa fa-chevron-left')))
      .add(page.create('div')
        .add(page.create('div').class('qm-docs-pagination-button-direction').text('Previous'))
        .add(page.create('div').class('qm-docs-pagination-button-description').text(previous.cs())))
  }

  if (entity.has('next')) {
    next = entity.select('next')
    nextButton = page.create('a')
      .attr('href', next.ps())
      .class('qm-docs-pagination-button qm-docs-pagination-button-next')
      .add(page.create('div')
        .add(page.create('div').class('qm-docs-pagination-button-direction').text('Next'))
        .add(page.create('div').class('qm-docs-pagination-button-description').text(next.cs())))
      .add(page.create('div')
        .add(page.create('i').class('qm-docs-pagination-button-arrow fa fa-chevron-right')))
  }

  return page.create('div').class('qm-docs-pagination-buttons')
    .add(prevButton)
    .add(nextButton)

}

function assetify (trans) {
  var newTransforms = {}
  Object.keys(trans).forEach(function (k) {
    newTransforms[k] = function (entity, page, transforms) {
      page.asset('quantum-docs.css', __dirname + '/client/quantum-docs.css')
      return trans[k](entity, page, transforms)
    }
  })
  return newTransforms
}

module.exports = function (options) {
  return assetify(transforms)
}

module.exports.assets = {
  'quantum-docs.css': __dirname + '/client/quantum-docs.css'
}

'use strict'
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const paragraphTransform = require('quantum-html').paragraphTransform
const path = require('path')

function transforms (opts) {
  const stylesheetAsset = dom.asset({
    url: '/assets/quantum-docs.css',
    file: path.join(__dirname, '/assets/quantum-docs.css'),
    shared: true
  })

  const scriptAsset = dom.asset({
    url: '/assets/quantum-docs.js',
    file: path.join(__dirname, '/assets/quantum-docs.js'),
    shared: true
  })

  const toContextClass = (context) => context ? 'qm-docs-' + context : ''
  const spinalCase = (string) => string.toLowerCase().split(' ').join('-')

  const topic = (selection, transforms) => {
    return dom.create('div')
      .class('qm-docs-topic')
      .add(stylesheetAsset)
      .add(dom.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
        .add(dom.create('div').class('qm-docs-topic-header')
          .text(selection.ps())
          .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
      .add(dom.create('div').class('qm-docs-topic-body').add(paragraphTransform(selection, transforms)))
  }

  const section = (selection, transforms) => {
    return dom.create('div')
      .class('qm-docs-section')
      .add(stylesheetAsset)
      .add(dom.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
        .add(dom.create('div').class('qm-docs-section-header')
          .text(selection.ps())
          .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
      .add(dom.create('div').class('qm-docs-section-body').add(paragraphTransform(selection, transforms)))
  }

  const subsection = (selection, transforms) => {
    return dom.create('div')
      .class('qm-docs-subsection')
      .add(stylesheetAsset)
      .add(dom.create('div').class('qm-docs-subsection-header').text(selection.ps()))
      .add(dom.create('div').class('qm-docs-subsection-body').add(paragraphTransform(selection, transforms)))
  }

  const notice = (selection, transforms) => {
    return dom.create('div')
      .class('qm-docs-notice ' + toContextClass(selection.param(1)))
      .add(stylesheetAsset)
      .add(dom.create('div').class('qm-docs-notice-header').text(selection.param(0) || ''))
      .add(dom.create('div').class('qm-docs-notice-body').add(paragraphTransform(selection, transforms)))
  }

  const list = (selection, transforms) => {
    const ordered = selection.ps() === 'ordered'
    return dom.create(ordered ? 'ol' : 'ul')
      .class('qm-docs-list')
      .add(stylesheetAsset)
      .add(dom.all(selection.selectAll('item').map((e) => {
        return dom.create('li')
          .add(paragraphTransform(e, transforms))
      })))
  }

  const bold = (selection, transforms) => {
    return dom.create('b').add(selection.transform(transforms))
  }

  const italic = (selection, transforms) => {
    return dom.create('i').add(selection.transform(transforms))
  }

  const strikethrough = (selection, transforms) => {
    return dom.create('del').add(selection.transform(transforms))
  }

  const image = (selection, transforms) => {
    return dom.create('img')
      .attr('src', selection.ps())
      .attr('alt', selection.cs())
      .attr('title', selection.cs())
  }

  const summary = (selection, transforms) => {
    const element = dom.create('div')
      .class('qm-docs-summary')
      .add(stylesheetAsset)
      .add(dom.create('div').text(selection.ps()).class('qm-docs-summary-header'))
      .add(dom.create('div').class('qm-docs-summary-body').add(selection.select('description').transform(transforms)))

    if (selection.has('link')) {
      selection.selectAll('link').forEach((link) => {
        element.add(dom.create('a').class('qm-docs-summary-link').attr('href', link.ps())
          .add(dom.create('span').text(link.cs()))
          .add(dom.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon')))
      })
    }

    return element
  }

  const group = (selection, transforms) => {
    return dom.create('div')
      .add(stylesheetAsset)
      .class('qm-docs-group')
      .add(selection.transform(transforms))
  }

  const versionSelector = (selection, transforms) => {
    const current = selection.select('versionList').select('current').ps()
    const versions = selection.select('versionList').selectAll('version').map(e => e.ps())

    if (versions.length > 0) {
      const id = dom.nextId()

      // XXX: make this configurable (it should be a function with no external dependencies that can run in browsers)
      const redirectorFunction = function (url, current, version) {
        if (url.indexOf((current + '/'), url.length - (current + '/').length) !== -1) {
          return '../' + version + '/'
        } else {
          return version + '/'
        }
      }

      const script = [
        'var redirectorFunction = ' + redirectorFunction.toString() + ';',
        'new hx.Menu("#' + id + '", {items: ' + JSON.stringify(versions) + ', renderer: function(e, v) {hx.select(e).append("a").attr("href", redirectorFunction(window.location.pathname, "' + current + '", v)).text(v)}})'
      ].join('\n')

      return dom.create('button')
        .id(id)
        .class('qm-docs-version-selector hx-btn')
        .add(stylesheetAsset)
        .add(dom.create('span').text(current + ' '))
        .add(dom.create('i').class('fa fa-caret-down'))
        .add(dom.create('script').text(script, {escape: false}))
    }
  }

  const sidebar = (selection, transforms) => {
    return dom.create('div')
      .add(stylesheetAsset)
      .add(scriptAsset)
      .class('qm-docs-sidebar ' + (selection.ps() === 'right' ? 'qm-docs-sidebar-right' : 'qm-docs-sidebar-left'))
      .add(selection.transform(transforms))
      .add(dom.bodyClassed('qm-docs-sidebar-page', true))
  }

  const tableOfContents = (selection, transforms) => {
    const toc = dom.create('div')
      .class('qm-docs-table-of-contents')
      .add(stylesheetAsset)

    const tocContainer = dom.create('ul').class('qm-docs-table-of-contents-container')

    if (selection.ps()) {
      toc.add(dom.create('h1').text(selection.ps()))
    }
    toc.add(tocContainer)

    selection.selectAll('topic', {recursive: true}).forEach((topic) => {
      const sections = topic.selectAll('section').map((section) => {
        return dom.create('li').add(dom.create('a')
          .class('qm-docs-table-of-contents-section')
          .attr('href', '#' + spinalCase(section.ps()))
          .text(section.ps()))
      })

      tocContainer.add(dom.create('li').class('qm-docs-table-of-contents-topic-container')
        .add(dom.create('a').class('qm-docs-table-of-contents-topic').attr('href', '#' + spinalCase(topic.ps())).text(topic.ps()))
        .add(dom.create('ul').add(sections)))
    })

    return toc
  }

  const navigationMenu = (selection, transforms) => {
    const sections = selection.selectAll('section').map((sectionEntity) => {
      const pages = sectionEntity.selectAll('page').map((pageEntity) => {
        return dom.create('a').class('qm-docs-navication-menu-page')
          .attr('href', pageEntity.ps())
          .text(pageEntity.cs())
      })

      return dom.create('div').class('qm-docs-navication-menu-section')
        .add(dom.create('div').class('qm-docs-navication-menu-section-title').text(sectionEntity.ps()))
        .add(dom.create('div').class('qm-docs-navication-menu-section-body').add(pages))
    })

    return dom.create('div')
      .add(stylesheetAsset)
      .class('qm-docs-navication-menu-wrapper')
      .add(
        dom.create('div').class('qm-docs-navication-menu').add(sections))
  }

  const header = (selection, transforms) => {
    return dom.create('div').class('qm-docs-header')
      .add(stylesheetAsset)
      .add(dom.create('div').class('qm-docs-centered')
        .add(dom.create('div').class('qm-docs-header-wrapper')
          .add(dom.create('div').class('qm-docs-header-title').text(selection.select('title').ps()))
          .add(selection.selectAll('link').map((e) => {
            return dom.create('a')
              .class('qm-docs-header-link')
              .attr('href', e.ps())
              .text(e.cs())
          }))
      ))
  }

  const breadcrumb = (selection, transforms) => {
    if (selection.selectAll('item').length === 0) {
      return undefined
    }

    const element = dom.create('div')
      .class('qm-docs-breadcrumb')
      .add(stylesheetAsset)

    const container = dom.create('div')
      .class('qm-docs-top-section-centered qm-docs-breadcrumb-padding')

    selection.selectAll('item').forEach((item, i) => {
      if (i > 0) {
        container.add(dom.create('i').class('fa fa-angle-right qm-docs-breadcrumb-arrow-icon'))
      }
      container.add(dom.create('a').attr('href', item.ps()).class('qm-docs-breadcrumb-section').text(item.cs()))
    })

    return element.add(container)
  }

  const topSection = (selection, transforms) => {
    const pageTitle = selection.select('title').ps()
    dom.title = pageTitle
    const sourceLink = selection.has('source') ? selection.select('source').ps() : undefined

    return dom.create('div').class('qm-docs-top-section')
      .add(stylesheetAsset)
      .add(breadcrumb(selection.select('breadcrumb'), transforms))
      .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
        .add(sourceLink ? dom.create('a').class('qm-docs-top-section-source').attr('href', sourceLink).text(selection.select('source').cs()) : undefined)
        .add(dom.create('div').class('qm-docs-top-section-title').text(pageTitle))
        .add(dom.create('div').class('qm-docs-top-section-description')
          .add(paragraphTransform(selection.select('description'), transforms))))
  }

  const contentSection = (selection, transforms) => {
    return dom.create('div').class('qm-docs-content-section-container')
      .add(stylesheetAsset)
      // .add(selection.filter('sidebar').transform(transforms))
      .add(dom.create('div').class('qm-docs-content-section')
        .add(dom.create('div').class('qm-docs-centered')
          .add(selection.transform(transforms))))
  }

  const bottomSection = (selection, transforms) => {
    return dom.create('div').class('qm-docs-bottom-section')
      .add(stylesheetAsset)
      .add(selection.transform(transforms))
  }

  const relatedButtons = (selection, transforms) => {
    const buttons = selection.selectAll('button').map((e) => {
      return dom.create('a')
        .attr('href', e.ps())
        .class('qm-docs-related-button')
        .add(dom.create('div')
          .add(dom.create('div').class('qm-docs-related-button-title').text(e.select('title').cs()))
          .add(dom.create('div').class('qm-docs-related-button-description').text(e.select('description').cs())))
    })

    return dom.create('div')
      .class('qm-docs-related-buttons')
      .add(stylesheetAsset)
      .add(buttons)
  }

  const table = (selection, transforms) => {
    function toRow (rowEntity) {
      const isHeader = rowEntity.type() === 'header'

      const cells = dom.all(rowEntity.selectAll('cell')
        .map(cellEntity => paragraphTransform(cellEntity, transforms))
        .map(cell => dom.create(isHeader ? 'th' : 'td').add(cell)))

      return dom.create('tr').add(cells)
    }

    const maybePromise = dom.all(selection.selectAll(['header', 'row']).map(toRow))

    if (maybePromise.then) {
      return maybePromise.then((rows) => {
        return dom.create('table')
          .class('qm-docs-table')
          .add(stylesheetAsset)
          .add(rows)
      })
    } else {
      return dom.create('table')
        .class('qm-docs-table')
        .add(stylesheetAsset)
        .add(maybePromise)
    }
  }

  return Object.freeze({
    topic,
    section,
    subsection,
    notice,
    list,
    bold,
    italic,
    strikethrough,
    image,
    summary,
    group,
    versionSelector,
    sidebar,
    tableOfContents,
    navigationMenu,
    header,
    breadcrumb,
    topSection,
    contentSection,
    bottomSection,
    relatedButtons,
    table
  })
}

function pipeline (opts) {
  return (obj) => {
    const toc = quantum.select(obj.content).select('tableOfContents', {recursive: true})
    const topics = quantum.select(obj.content).selectAll('topic', {recursive: true})

    topics.forEach((topic) => {
      toc.add({
        type: 'topic',
        params: topic.params().slice(0),
        content: topic.selectAll('section').map((section) => {
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

module.exports = pipeline
module.exports.transforms = transforms

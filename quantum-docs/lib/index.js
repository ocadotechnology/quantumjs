'use strict'

const path = require('path')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const html = require('quantum-html')

const stylesheetAsset = dom.asset({
  url: '/assets/quantum-docs.css',
  file: path.join(__dirname, '../assets/quantum-docs.css'),
  shared: true
})

const scriptAsset = dom.asset({
  url: '/assets/quantum-docs.js',
  file: path.join(__dirname, '../assets/quantum-docs.js'),
  shared: true
})

function toContextClass (context) {
  return context ? 'qm-docs-' + context : ''
}

function spinalCase (string) {
  return string.toLowerCase().split(' ').join('-')
}

function topic (selection, transforms) {
  return dom.create('div')
    .class('qm-docs-topic')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
      .add(dom.create('div').class('qm-docs-topic-header')
        .text(selection.ps())
        .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
    .add(dom.create('div').class('qm-docs-topic-body').add(html.paragraphTransform(selection, transforms)))
}

function section (selection, transforms) {
  return dom.create('div')
    .class('qm-docs-section')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
      .add(dom.create('div').class('qm-docs-section-header')
        .text(selection.ps())
        .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
    .add(dom.create('div').class('qm-docs-section-body').add(html.paragraphTransform(selection, transforms)))
}

function subsection (selection, transforms) {
  return dom.create('div')
    .class('qm-docs-subsection')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-subsection-header').text(selection.ps()))
    .add(dom.create('div').class('qm-docs-subsection-body').add(html.paragraphTransform(selection, transforms)))
}

function notice (selection, transforms) {
  const contextClass = toContextClass(selection.param(1))
  return dom.create('div')
    .class('qm-docs-notice' + (contextClass ? ' ' + contextClass : ''))
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-notice-header').text(selection.param(0) || ''))
    .add(dom.create('div').class('qm-docs-notice-body').add(html.paragraphTransform(selection, transforms)))
}

function list (selection, transforms) {
  const ordered = selection.ps() === 'ordered'
  return dom.create(ordered ? 'ol' : 'ul')
    .class('qm-docs-list')
    .add(stylesheetAsset)
    .add(selection.selectAll('item').map((e) => {
      return dom.create('li')
        .add(html.paragraphTransform(e, transforms))
    }))
}

function bold (selection, transforms) {
  return dom.create('b').add(selection.transform(transforms))
}

function italic (selection, transforms) {
  return dom.create('i').add(selection.transform(transforms))
}

function strikethrough (selection, transforms) {
  return dom.create('del').add(selection.transform(transforms))
}

function image (selection, transforms) {
  return dom.create('img')
    .attr('src', selection.ps())
    .attr('alt', selection.cs())
    .attr('title', selection.cs())
}

function summary (selection, transforms) {
  return dom.create('div')
    .class('qm-docs-summary')
    .add(stylesheetAsset)
    .add(dom.create('div').text(selection.ps()).class('qm-docs-summary-header'))
    .add(dom.create('div').class('qm-docs-summary-body').add(selection.select('description').transform(transforms)))
    .add(selection.selectAll('link').map(link => {
      return dom.create('a').class('qm-docs-summary-link').attr('href', link.ps())
        .add(dom.create('span').text(link.cs()))
        .add(dom.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon'))
    }))
}

function group (selection, transforms) {
  return dom.create('div')
    .add(stylesheetAsset)
    .class('qm-docs-group')
    .add(selection.transform(transforms))
}

function versionSelector (selection, transforms) {
  const current = selection.select('versionList').select('current').ps()
  const versions = selection.select('versionList').selectAll('version').map(e => e.ps())

  if (versions.length > 0) {
    const id = dom.randomId()

    const script = 'window.quantum.docs.createDropdown("' + id + '", [' + versions.map(v => '"' + v + '"').join(', ') + '], "' + current + '");'

    return dom.create('button')
      .id(id)
      .class('qm-docs-version-selector hx-btn')
      .add(stylesheetAsset)
      .add(dom.create('span').text(current))
      .add(dom.create('i').class('fa fa-caret-down'))
      .add(dom.create('script').text(script, {escape: false}))
  }
}

function sidebar (selection, transforms) {
  return dom.create('div')
    .add(stylesheetAsset)
    .add(scriptAsset)
    .class('qm-docs-sidebar')
    .add(selection.transform(transforms))
}

function sidebarPage (selection, transforms) {
  return dom.create('div')
    .add(stylesheetAsset)
    .class('qm-docs-sidebar-page')
    .add(selection.filter('sidebar').transform(transforms))
    .add(dom.create('div').class('qm-docs-content-section-container')
      .add(selection.select('content').transform(transforms)))
    .add(dom.bodyClassed('qm-docs-sidebar-page', true))
}

function tableOfContents (selection, transforms) {
  const topics = selection.selectAll('topic', {recursive: true}).map((topic) => {
    const sections = topic.selectAll('section').map((section) => {
      return dom.create('li').add(
        dom.create('a')
          .class('qm-docs-table-of-contents-section')
          .attr('href', '#' + spinalCase(section.ps()))
          .text(section.ps())
      )
    })

    return dom.create('li').class('qm-docs-table-of-contents-topic-container')
      .add(dom.create('a').class('qm-docs-table-of-contents-topic').attr('href', '#' + spinalCase(topic.ps())).text(topic.ps()))
      .add(dom.create('ul').add(sections))
  })

  return dom.create('div')
    .class('qm-docs-table-of-contents')
    .add(stylesheetAsset)
    .add(selection.ps() ? dom.create('h1').text(selection.ps()) : undefined)
    .add(dom.create('ul')
      .class('qm-docs-table-of-contents-container')
      .add(topics)
  )
}

function navigationMenu (selection, transforms) {
  const sections = selection.selectAll('section').map((sectionEntity) => {
    const pages = sectionEntity.selectAll('page').map((pageEntity) => {
      return dom.create('a').class('qm-docs-navigation-menu-page')
        .attr('href', pageEntity.ps())
        .text(pageEntity.cs())
    })

    return dom.create('div').class('qm-docs-navigation-menu-section')
      .add(dom.create('div').class('qm-docs-navigation-menu-section-title').text(sectionEntity.ps()))
      .add(dom.create('div').class('qm-docs-navigation-menu-section-body').add(pages))
  })

  return dom.create('div')
    .add(stylesheetAsset)
    .class('qm-docs-navigation-menu-wrapper')
    .add(dom.create('div').class('qm-docs-navigation-menu').add(sections))
}

function header (selection, transforms) {
  return dom.create('div').class('qm-docs-header')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-centered')
      .add(dom.create('div').class('qm-docs-header-wrapper')
        .add(selection.has('icon') ? dom.create('image').class('qm-docs-header-logo').attr('src', selection.select('icon').ps()) : undefined)
        .add(dom.create('div').class('qm-docs-header-title').text(selection.select('title').ps()))
        .add(selection.selectAll('link').map((e) => {
          return dom.create('a')
            .class('qm-docs-header-link')
            .attr('href', e.ps())
            .text(e.cs())
        }))
    ))
}

function breadcrumb (selection, transforms) {
  if (selection.selectAll('item').length === 0) {
    return
  }

  const items = selection.selectAll('item').map((item, i) => {
    return [
      (i > 0) ? dom.create('i').class('fa fa-angle-right qm-docs-breadcrumb-arrow-icon') : undefined,
      dom.create('a').attr('href', item.ps()).class('qm-docs-breadcrumb-section').text(item.cs())
    ]
  })

  return dom.create('div')
    .class('qm-docs-breadcrumb')
    .add(stylesheetAsset)
    .add(dom.create('div')
      .class('qm-docs-top-section-centered qm-docs-breadcrumb-padding')
      .add(items)
  )
}

function topSection (selection, transforms) {
  const pageTitle = selection.select('title').ps()
  const source = selection.has('source') ? selection.select('source') : undefined

  return dom.create('div').class('qm-docs-top-section')
    .add(pageTitle ? dom.head(dom.create('title').attr('name', pageTitle), {id: 'title'}) : undefined)
    .add(stylesheetAsset)
    .add(breadcrumb(selection.select('breadcrumb'), transforms))
    .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
      .add(source ? dom.create('a').class('qm-docs-top-section-source').attr('href', source.ps()).text(source.cs()) : undefined)
      .add(dom.create('div').class('qm-docs-top-section-title').text(pageTitle))
      .add(dom.create('div').class('qm-docs-top-section-description')
        .add(html.paragraphTransform(selection.select('description'), transforms))))
}

function contentSection (selection, transforms) {
  return dom.create('div').class('qm-docs-content-section')
    .add(stylesheetAsset)
    .add(selection.transform(transforms))
}

function bottomSection (selection, transforms) {
  return dom.create('div').class('qm-docs-bottom-section')
    .add(stylesheetAsset)
    .add(selection.transform(transforms))
}

function relatedButtons (selection, transforms) {
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

function table (selection, transforms) {
  function createRow (row) {
    const isHeader = row.type() === 'header'
    return dom.create('tr').add(row.selectAll('cell').map(cell => {
      return dom.create(isHeader ? 'th' : 'td')
        .add(html.paragraphTransform(cell, transforms))
    }))
  }

  const table = dom.create('table')
    .class('qm-docs-table')

  if (selection.has('header')) {
    table.add(dom.create('thead')
      .add(selection.selectAll('header').map(createRow)))
  }
  if (selection.has('row')) {
    table.add(dom.create('thead')
      .add(selection.selectAll('row').map(createRow)))
  }

  return table
    .add(stylesheetAsset)
}

function transforms (opts) {
  return Object.freeze({
    topic: topic,
    section: section,
    subsection: subsection,
    notice: notice,
    list: list,
    bold: bold,
    italic: italic,
    strikethrough: strikethrough,
    image: image,
    summary: summary,
    group: group,
    versionSelector: versionSelector,
    sidebarPage: sidebarPage,
    sidebar: sidebar,
    tableOfContents: tableOfContents,
    navigationMenu: navigationMenu,
    header: header,
    breadcrumb: breadcrumb,
    topSection: topSection,
    contentSection: contentSection,
    bottomSection: bottomSection,
    relatedButtons: relatedButtons,
    table: table
  })
}

function populateTableOfContents (page) {
  const toc = quantum.select(page.content).select('tableOfContents', {recursive: true})
  const topics = quantum.select(page.content).selectAll('topic', {recursive: true})

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
}

function pipeline (options) {
  const opts = options || {}
  const populateTableOfContentsOptions = opts.populateTableOfContents || {}
  const populateTableOfContentsEnabled = (populateTableOfContentsOptions.enabled !== false)
  return (page) => {
    if (populateTableOfContentsEnabled) {
      populateTableOfContents(page)
    }
    return page
  }
}

module.exports = pipeline
module.exports.transforms = transforms

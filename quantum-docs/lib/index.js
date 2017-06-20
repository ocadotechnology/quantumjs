'use strict'

const path = require('path')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const html = require('quantum-html')

const stylesheetAsset = dom.asset({
  url: '/quantum-docs.css',
  filename: path.join(__dirname, '../assets/quantum-docs.css'),
  shared: true
})

const scriptAsset = dom.asset({
  url: '/quantum-docs.js',
  filename: path.join(__dirname, '../assets/quantum-docs.js'),
  shared: true
})

function toContextClass (context) {
  return context ? `qm-docs-${context}` : ''
}

function spinalCase (string) {
  return string.toLowerCase().split(' ').join('-')
}

function fullWidth (selection, transformer) {
  return dom.create('div').class('qm-docs-full-width')
    .add(selection.transform(transformer))
}

function topic (selection, transformer) {
  return dom.create('div')
    .class('qm-docs-topic')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
      .add(dom.create('div').class('qm-docs-topic-header qm-header-font')
        .text(selection.ps())
        .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
    .add(dom.create('div').class('qm-docs-topic-body').add(html.paragraphTransform(selection, transformer)))
}

function section (selection, transformer) {
  return dom.create('div')
    .class('qm-docs-section')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-anchor').id(spinalCase(selection.ps()))
      .add(dom.create('div').class('qm-docs-section-header qm-header-font')
        .text(selection.ps())
        .add(dom.create('a').class('qm-docs-anchor-icon').attr('href', '#' + spinalCase(selection.ps())))))
    .add(dom.create('div').class('qm-docs-section-body').add(html.paragraphTransform(selection, transformer)))
}

function subsection (selection, transformer) {
  return dom.create('div')
    .class('qm-docs-subsection')
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-subsection-header qm-header-font').text(selection.ps()))
    .add(dom.create('div').class('qm-docs-subsection-body').add(html.paragraphTransform(selection, transformer)))
}

function notice (selection, transformer) {
  const contextClass = toContextClass(selection.param(1))
  return dom.create('div')
    .class('qm-docs-notice' + (contextClass ? ' ' + contextClass : ''))
    .add(stylesheetAsset)
    .add(dom.create('div').class('qm-docs-notice-header qm-header-font').text(selection.param(0) || ''))
    .add(dom.create('div').class('qm-docs-notice-body').add(html.paragraphTransform(selection, transformer)))
}

function list (selection, transformer) {
  const ordered = selection.ps() === 'ordered'
  return dom.create(ordered ? 'ol' : 'ul')
    .class('qm-docs-list')
    .add(stylesheetAsset)
    .add(selection.selectAll('item').map((e) => {
      return dom.create('li')
        .add(html.paragraphTransform(e, transformer))
    }))
}

function bold (selection, transformer) {
  return dom.create('b').add(selection.transform(transformer))
}

function italic (selection, transformer) {
  return dom.create('i').add(selection.transform(transformer))
}

function strikethrough (selection, transformer) {
  return dom.create('del').add(selection.transform(transformer))
}

function image (selection, transformer) {
  const width = selection.has('width') ? selection.select('width').ps() : undefined
  const height = selection.has('height') ? selection.select('height').ps() : undefined
  const title = selection.has('title') ? selection.select('title').cs() : selection.cs()

  return dom.create('img')
    .attr('src', selection.param(0))
    .attr('alt', title)
    .attr('title', title)
    .attr('width', width)
    .attr('height', height)
}

function summary (selection, transformer) {
  return dom.create('div')
    .class('qm-docs-summary')
    .add(stylesheetAsset)
    .add(dom.create('div').text(selection.ps()).class('qm-docs-summary-header qm-header-font'))
    .add(dom.create('div').class('qm-docs-summary-body').add(selection.select('description').transform(transformer)))
    .add(selection.selectAll('link').map(link => {
      return dom.create('a').class('qm-docs-summary-link').attr('href', link.ps())
        .add(dom.create('span').text(link.cs()))
        .add(dom.create('i').class('fa fa-chevron-right qm-docs-summary-link-icon'))
    }))
}

function group (selection, transformer) {
  return dom.create('div')
    .add(stylesheetAsset)
    .class('qm-docs-group')
    .add(selection.transform(transformer))
}

function versionSelector (selection, transformer) {
  const current = selection.select('versionList').select('current').ps()
  const versions = selection.select('versionList').selectAll('version').map(e => e.ps())

  if (versions.length > 0) {
    const id = dom.randomId()

    const script = 'window.quantum.docs.createDropdown("' + id + '", [' + versions.map(v => '"' + v + '"').join(', ') + '], "' + current + '");'

    const versionScriptAsset = dom.asset({
      type: 'js',
      content: script
    })

    return dom.create('select')
      .id(id)
      .class('qm-docs-version-selector')
      .add(stylesheetAsset)
      .add(scriptAsset)
      .add(versionScriptAsset)
  }
}

function sidebar (selection, transformer) {
  return dom.create('div')
    .add(stylesheetAsset)
    .add(scriptAsset)
    .class('qm-docs-sidebar')
    .add(selection.transform(transformer))
}

function sidebarPage (selection, transformer) {
  return dom.create('div')
    .add(stylesheetAsset)
    .class('qm-docs-sidebar-page')
    .add(selection.filter('sidebar').transform(transformer))
    .add(dom.create('div').class('qm-docs-content-section-container')
      .add(selection.select('content').transform(transformer)))
    .add(dom.bodyClassed('qm-docs-sidebar-page', true))
}

function tableOfContents (selection, transformer) {
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

function makeNavigationMenuSection (sectionEntity) {
  const pages = sectionEntity.selectAll('page').map(makeNavigationMenuPage)

  return dom.create('div').class('qm-docs-navigation-menu-section')
    .add(dom.create('div').class('qm-docs-navigation-menu-section-title').text(sectionEntity.ps()))
    .add(dom.create('div').class('qm-docs-navigation-menu-section-body').add(pages))
}

function makeNavigationMenuPage (pageEntity) {
  return dom.create('a').class('qm-docs-navigation-menu-page')
    .attr('href', pageEntity.ps())
    .text(pageEntity.cs())
}

function navigationMenu (selection, transformer) {
  const pages = selection.selectAll('page').map(makeNavigationMenuPage)
  const sections = selection.selectAll('section').map(makeNavigationMenuSection)

  return dom.create('div')
    .add(stylesheetAsset)
    .class('qm-docs-navigation-menu-wrapper')
    .add(dom.create('div').class('qm-docs-navigation-menu').add(pages).add(sections))
}

function makeHeaderIcon (icon) {
  const image = dom.create('image').class('qm-docs-header-logo').attr('src', icon.param(0))
  if (icon.param(1)) {
    return dom.create('a').class('qm-docs-header-logo-link')
      .attr('href', icon.param(1))
      .add(image)
  } else {
    return image
  }
}

function header (selection, transformer) {
  const mobileNavId = dom.randomId()

  const mobileNavScriptAsset = dom.asset({
    type: 'js',
    content: 'window.quantum.docs.createHeaderToggle("' + mobileNavId + '");'
  })

  return dom.create('div').class('qm-docs-header')
    .add(dom.create('div').class('qm-docs-centered')
      .add(dom.create('div').class('qm-docs-header-wrapper')
        .add(selection.has('icon') ? makeHeaderIcon(selection.select('icon')) : undefined)
        .add(dom.create('div').class('qm-docs-header-title qm-header-font').text(selection.select('title').ps()))
        .add(dom.create('div').class('qm-docs-header-mobile-menu')
          .id('nav.toggle.' + mobileNavId)
          .add(dom.create('i').class('qm-docs-header-mobile-menu-icon')))
        .add(dom.create('div').class('qm-docs-header-links')
          .id('nav.links.' + mobileNavId)
          .add(selection.selectAll('link').map((e) => {
            return dom.create('a')
              .class('qm-docs-header-link')
              .attr('href', e.ps())
              .text(e.cs())
          })))
    ))
    .add(stylesheetAsset)
    .add(scriptAsset)
    .add(mobileNavScriptAsset)
}

function breadcrumb (selection, transformer) {
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

function topSection (selection, transformer) {
  const pageTitle = selection.select('title').ps()
  const source = selection.has('source') ? selection.select('source') : undefined

  return dom.create('div').class('qm-docs-top-section')
    .add(pageTitle ? dom.head(dom.create('title').text(pageTitle), {id: 'title'}) : undefined)
    .add(stylesheetAsset)
    .add(breadcrumb(selection.select('breadcrumb'), transformer))
    .add(dom.create('div').class('qm-docs-top-section-centered qm-docs-top-section-banner')
      .add(source ? dom.create('a').class('qm-docs-top-section-source').attr('href', source.ps()).text(source.cs()) : undefined)
      .add(dom.create('div').class('qm-docs-top-section-title qm-header-font').text(pageTitle))
      .add(dom.create('div').class('qm-docs-top-section-description')
        .add(html.paragraphTransform(selection.select('description'), transformer))))
}

function contentSection (selection, transformer) {
  return dom.create('div').class('qm-docs-content-section')
    .add(stylesheetAsset)
    .add(selection.transform(transformer))
}

function bottomSection (selection, transformer) {
  return dom.create('div').class('qm-docs-bottom-section')
    .add(stylesheetAsset)
    .add(selection.transform(transformer))
}

function relatedButtons (selection, transformer) {
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

function table (selection, transformer) {
  function createRow (row) {
    const isHeader = row.type() === 'header'
    return dom.create('tr').add(row.selectAll('cell').map(cell => {
      return dom.create(isHeader ? 'th' : 'td')
        .add(html.paragraphTransform(cell, transformer))
    }))
  }

  const table = dom.create('table')
    .class('qm-docs-table')

  if (selection.has('header')) {
    table.add(dom.create('thead').class('qm-header-font')
      .add(selection.selectAll('header').map(createRow)))
  }
  if (selection.has('row')) {
    table.add(dom.create('tbody')
      .add(selection.selectAll('row').map(createRow)))
  }

  return table
    .add(stylesheetAsset)
}

function entityTransforms (opts) {
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
    sidebarPage,
    sidebar,
    tableOfContents,
    navigationMenu,
    header,
    breadcrumb,
    topSection,
    contentSection,
    fullWidth,
    bottomSection,
    relatedButtons,
    table
  })
}

function populateTableOfContents (page, options) {
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

function fileTransform (options) {
  const opts = options || {}
  const tableOfContentsOptions = opts.tableOfContents || {}
  const populateTableOfContentsEnabled = tableOfContentsOptions.enabled !== false
  return (page) => {
    if (populateTableOfContentsEnabled) {
      populateTableOfContents(page, tableOfContentsOptions)
    }
    return page
  }
}

module.exports = {
  fileTransform,
  entityTransforms
}

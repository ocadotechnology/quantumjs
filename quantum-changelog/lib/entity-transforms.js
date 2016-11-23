'use strict'

/*
  This file defines the entity transforms for the changelog module. There
  are two transforms:

    @changelog
    @changelogList

  The @changelog entity is for a single version. Meaning, to document the changes
  to a single api there will be multiple @changelog entries. (The @changelogList entity
  helps with this, see details below). The @changelog entity has a description and entries.

  Entries (@entry) within a changelog can be grouped using @group. For example,
  this is used in hexagon to split up changes by module in the master changelog.
  Groups are displayed in collapsibles and have a summary of the additions,
  removals, updates, etc in the header of the collapsible.
*/

const path = require('path')

const dom = require('quantum-dom')
const html = require('quantum-html')

const config = require('./config.js')
const utils = require('./utils')

const assets = [
  dom.asset({
    url: '/quantum-changelog.css',
    file: path.join(__dirname, '../assets/quantum-changelog.css'),
    shared: true
  }),
  dom.asset({
    url: '/quantum-changelog.js',
    file: path.join(__dirname, '../assets/quantum-changelog.js'),
    shared: true
  }),
  dom.asset({
    url: '/quantum-changelog-icons.css',
    file: path.join(__dirname, '../assets/quantum-changelog-icons.css'),
    shared: true
  }),
  dom.asset({
    url: '/fonts/quantum-changelog-icons.eot',
    file: path.join(__dirname, '../assets/fonts/quantum-changelog-icons.eot'),
    shared: true
  }),
  dom.asset({
    url: '/fonts/quantum-changelog-icons.svg',
    file: path.join(__dirname, '../assets/fonts/quantum-changelog-icons.svg'),
    shared: true
  }),
  dom.asset({
    url: '/fonts/quantum-changelog-icons.ttf',
    file: path.join(__dirname, '../assets/fonts/quantum-changelog-icons.ttf'),
    shared: true
  }),
  dom.asset({
    url: '/fonts/quantum-changelog-icons.woff',
    file: path.join(__dirname, '../assets/fonts/quantum-changelog-icons.woff'),
    shared: true
  })
]

/* Creates a paragraph section wrapped in a div */
function wrappedParagraph (cls, selection, transforms) {
  return dom.create('div')
    .class(cls)
    .add(html.paragraphTransform(selection, transforms))
}

/* Creates a link entity wrapped in a div */
function linkEntity (cls, url, text) {
  return dom.create('div')
    .class(cls)
    .add(dom.create('a').attr('href', url).add(text))
}

/* Given header and content elements, this wraps them up into a collapsible */
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

/* Creates a label element - for showing the number of updates, additions removals, etc.. */
function label (tagType, iconClass, count) {
  return dom.create('div').class('qm-changelog-label ' + 'qm-changelog-label-' + tagType)
    .add(dom.create('i').class(iconClass))
    .add(dom.create('span').text(count))
}

function changeDom (selection, transforms, tagsByName, issueUrl) {
  const changeType = selection.param(0)
  const tagByName = tagsByName[changeType]

  const iconClass = tagByName ? tagByName.iconClass ? tagByName.iconClass + ' ' : '' : ''
  const displayName = tagByName ? tagByName.displayName : undefined

  const issues = selection.has('issue') ?
    dom.create('span').class('qm-changelog-change-issues')
      .add(selection.selectAll('issue').map(issue => {
        return dom.create('a')
          .class('qm-changelog-change-issue')
          .attr('href', issueUrl(issue.ps()))
          .text('#' + issue.ps())
      })) : undefined

  const icon = tagByName ? dom.create('i')
    .class(iconClass + 'qm-changelog-text-' + changeType)
    .attr('title', displayName) : undefined

  return dom.create('div').class('qm-changelog-change')
    .add(dom.create('div').class('qm-changelog-change-header')
      .add(dom.create('div').class('qm-changelog-change-icon')
        .add(icon))
      .add(dom.create('div').class('qm-changelog-change-type').text(displayName))
      .add(issues))
    .add(dom.create('div').class('qm-changelog-change-body')
      .add(selection.has('description') ? html.paragraphTransform(selection.select('description'), transforms) : undefined))
}

/* Creates a single changelog entry */
function entry (selection, transforms, options) {
  const language = options.languages.find(language => language.name === selection.select('header').ps())
  const headerSelection = selection.select('header')
  const header = language ? language.createHeaderDom(headerSelection, transforms) : undefined
  const changes = selection.selectAll('change')
    .map(change => changeDom(change, transforms, options.tags, options.issueUrl))

  return dom.create('div').class('qm-changelog-entry')
    .add(dom.create('div').class('qm-changelog-entry-header').add(header))
    .add(dom.create('div').class('qm-changelog-entry-content').add(changes))
}

/* Creates a group of entries displayed as a collapsible */
function group (selection, transforms, options) {
  const link = selection.has('link') ?
    linkEntity('qm-changelog-group-link', selection.select('link').ps(), selection.ps()) :
    undefined

  const title = dom.create('div').class('qm-changelog-group-title')
    .add(link || selection.ps())

  const entryEntities = selection.selectAll('entry')
    .sort(utils.compareEntrySelections)

  const topLevelChanges = selection.selectAll('change')
    .map(change => {
      return dom.create('div')
        .class('qm-changelog-entry')
        .add(changeDom(change, transforms, options.tags, options.issueUrl))
    })

  const entries = dom.create('div').class('qm-changelog-group-entries')
    .add(topLevelChanges)
    .add(entryEntities.map(ent => entry(ent, transforms, options)))

  const labels = dom.create('div').class('qm-changelog-group-labels')
    .add(Object.keys(options.tags).map(tagType => {
      const topLevelCount = selection.selectAll('change').reduce((acc, change) => {
        return change.param(0) === tagType ? acc + 1 : acc
      }, 0)
      const entrySubCount = entryEntities.reduce((total, entry) => {
        const subtotal = entry.selectAll('change').reduce((acc, change) => {
          return change.param(0) === tagType ? acc + 1 : acc
        }, 0)
        return total + subtotal
      }, 0)
      const count = topLevelCount + entrySubCount
      return count > 0 ? label(tagType, options.tags[tagType].iconClass, count) : undefined
    }))

  const header = dom.create('div').class('qm-changelog-group-head')
    .add(title)
    .add(labels)

  const description = selection.has('description') ?
    wrappedParagraph('qm-changelog-description', selection.select('description'), transforms) :
    undefined

  const content = dom.create('div').class('qm-changelog-group-body')
    .add(description)
    .add(entries)

  return dom.create('div').class('qm-changelog-group')
    .add(createCollapsible(header, content))
}

function changelog (selection, transforms, options) {
  const description = selection.has('description') ?
    wrappedParagraph('qm-changelog-description', selection.select('description'), transforms) :
    undefined

  const groups = selection.selectAll('group')
    .map(grp => group(grp, transforms, options))

  const entries = selection.selectAll('entry')
    .map(ent => entry(ent, transforms, options))

  if (description || groups.length > 0 || entries.length > 0) {
    const link = selection.has('link') ?
      linkEntity('qm-changelog-link', selection.select('link').ps(), selection.ps()) :
      undefined

    const title = link || selection.ps()

    return dom.create('div').class('qm-changelog')
      .add(assets)
      .add(options.languages.map(l => l.assets))
      .add(dom.create('div').class('qm-changelog-head').add(title))
      .add(dom.create('div').class('qm-changelog-body')
        .add(description)
        .add(groups)
        .add(entries))
  }
}

/*
  A changelogList for multiple @changelog entries. Also used by the page entry as a
  place to generate @changelog entries in.
*/
function changelogList (selection, transforms) {
  return dom.create('div').class('qm-changelog-list')
    .add(selection.filter('changelog').transform(transforms))
}

/* Factory for the entity transforms for changelog */
function transforms (options) {
  const resolvedOptions = config.resolve(options)

  return Object.freeze({
    changelog: (selection, transforms) => changelog(selection, transforms, resolvedOptions),
    changelogList: changelogList
  })
}

module.exports.transforms = transforms
module.exports.createCollapsible = createCollapsible
module.exports.changeDom = changeDom
module.exports.label = label
module.exports.assets = assets

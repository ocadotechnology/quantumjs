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

const quantum = require('quantum-js')
const dom = require('quantum-dom')
const html = require('quantum-html')
const tags = require('../tags')
const utils = require('../utils')

function domAsset (filename) {
  return dom.asset({
    url: '/' + filename,
    file: path.join(__dirname, '../../assets/' + filename),
    shared: true
  })
}

const assets = [
  domAsset('quantum-api.css'),
  domAsset('quantum-changelog.css'),
  domAsset('quantum-changelog.js'),
  domAsset('quantum-changelog-icons.css')
]

/* Creates a paragraph section wrapped in a div */
function wrappedParagraph (cls, selection, transformer) {
  return dom.create('div')
    .class(cls)
    .add(html.paragraphTransform(selection, transformer))
}

/* Creates a link entity wrapped in a div */
function linkEntity (cls, url, text) {
  return dom.create('div')
    .class(cls)
    .add(dom.create('a').attr('href', url).add(text))
}

/* Given header and content elements, this wraps them up into a collapsible */
function createCollapsible (header, content) {
  // XXX: duplicated
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
function label (tagType, count) {
  const icon = tagType ? dom.create('i')
    .class(`qm-changelog-icon-${tagType} qm-changelog-text-${tagType}`)
    .attr('title', tags.displayName[tagType]) : undefined

  return dom.create('div').class('qm-changelog-label qm-changelog-label-' + tagType)
    .add(icon)
    .add(dom.create('span').text(count))
}

function changeDom (selection, transformer, issueUrl) {
  const changeType = selection.param(0)
  const tagDisplayName = tags.displayName[changeType]

  const displayName = tagDisplayName || undefined

  const issues = selection.has('issue') ?
    dom.create('span').class('qm-changelog-change-issues')
      .add(selection.selectAll('issue').map(issue => {
        return dom.create('a')
          .class('qm-changelog-change-issue')
          .attr('href', issueUrl(issue.ps()))
          .text('#' + issue.ps())
      })) : undefined

  const icon = tagDisplayName ? dom.create('i')
    .class(`qm-changelog-icon-${changeType} qm-changelog-text-${changeType}`)
    .attr('title', displayName) : undefined

  return dom.create('div').class('qm-changelog-change')
    .add(dom.create('div').class('qm-changelog-change-header')
      .add(dom.create('div').class('qm-changelog-change-icon')
        .add(icon))
      .add(dom.create('div').class('qm-changelog-change-type').text(displayName))
      .add(issues))
    .add(dom.create('div').class('qm-changelog-change-body')
      .add(selection.has('description') ? html.paragraphTransform(selection.select('description'), transformer) : undefined))
}

/* Creates a single changelog entry */
function entry (selection, transformer, options) {
  const languageTransforms = (options.languages.find(language => language.name === selection.select('header').ps()) || {}).changelogHeaderTransforms

  let header = undefined
  if (languageTransforms) {
    const headerSel = quantum.select(selection.select('header').content()[0])
    const headerItemType = headerSel.type()
    if (languageTransforms[headerItemType]) {
      header = languageTransforms[headerItemType](headerSel, transformer)
    }
  }

  const changes = selection.selectAll('change')
    .map(change => changeDom(change, transformer, options.issueUrl))

  return dom.create('div').class('qm-changelog-entry')
    .add(dom.create('div').class('qm-changelog-entry-header qm-code-font').add(header))
    .add(dom.create('div').class('qm-changelog-entry-content').add(changes))
}

/* Creates a group of entries displayed as a collapsible */
function group (selection, transformer, options) {
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
        .add(changeDom(change, transformer, options.issueUrl))
    })

  const entries = dom.create('div').class('qm-changelog-group-entries')
    .add(topLevelChanges)
    .add(entryEntities.map(ent => entry(ent, transformer, options)))

  const labels = dom.create('div').class('qm-changelog-group-labels')
    .add(tags.map(tagType => {
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
      return count > 0 ? label(tagType, count) : undefined
    }))

  const header = dom.create('div').class('qm-changelog-group-head')
    .add(title)
    .add(labels)

  const description = selection.has('description') ?
    wrappedParagraph('qm-changelog-description', selection.select('description'), transformer) :
    undefined

  const content = dom.create('div').class('qm-changelog-group-body')
    .add(description)
    .add(entries)

  return dom.create('div').class('qm-changelog-group')
    .add(createCollapsible(header, content))
}

module.exports = function changelog (options) {
  return (selection, transformer) => {
    const languages = (options || {}).languages || []
    const description = selection.has('description') ?
      wrappedParagraph('qm-changelog-description', selection.select('description'), transformer) :
      undefined

    const groups = selection.selectAll('group')
      .map(grp => group(grp, transformer, options))

    const entries = selection.selectAll('entry')
      .map(ent => entry(ent, transformer, options))

    if (description || groups.length > 0 || entries.length > 0) {
      const link = selection.has('link') ?
        linkEntity('qm-changelog-link', selection.select('link').ps(), selection.ps()) :
        undefined

      const title = link || selection.ps()

      return dom.create('div').class('qm-changelog')
        .add(assets)
        .add(languages.map(l => l.assets))
        .add(dom.create('div').class('qm-changelog-head qm-header-font').add(title))
        .add(dom.create('div').class('qm-changelog-body')
          .add(description)
          .add(groups)
          .add(entries))
    }
  }
}

module.exports.createCollapsible = createCollapsible
module.exports.changeDom = changeDom
module.exports.label = label
module.exports.assets = assets

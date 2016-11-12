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

// const quantum = require('quantum-js')
// const Promise = require('bluebird')
const merge = require('merge')
const dom = require('quantum-dom')
const path = require('path')
const html = require('quantum-html')
const utils = require('./utils')

const defaultConfig = require('./config.js')

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
function label (tag, count) {
  return dom.create('div').class('qm-changelog-label ' + 'qm-changelog-label-' + tag.entityType)
    .add(dom.create('i').class(tag.iconClass))
    .add(dom.create('span').text(count))
}

function changeDom (selection, transforms, tagsByName, options) {
  const changeType = selection.param(0)

  const issues = options.issueUrl && selection.has('issue') ?
    dom.create('span').class('qm-changelog-change-issues')
      .add(selection.selectAll('issue').map((issue) => {
        return dom.create('a')
          .class('qm-changelog-change-issue')
          .attr('href', options.issueUrl + issue.ps())
          .text('#' + issue.ps())
      })) : undefined

  const icon = dom.create('div')
    .class('qm-changelog-change-icon')
    .add(dom.create('i')
      .class(tagsByName[changeType].iconClass + ' qm-changelog-text-' + changeType)
      .attr('title', tagsByName[changeType].displayName))

  return dom.create('div')
    .class('qm-changelog-change')
    .add(dom.create('div').class('qm-changelog-change-header')
      .add(icon)
      .add(dom.create('div').class('qm-changelog-change-type').text(tagsByName[changeType].displayName))
      .add(issues))
    .add(dom.create('div').class('qm-changelog-change-body')
      .add(selection.has('description') ? html.paragraphTransform(selection.select('description'), transforms) : undefined))
}

function defaultHeader (selection) {
  // XXX: implement
}

/* Creates a single changelog entry */
function entry (selection, transforms, options, tagsByName) {
  const language = options.languages.find(language => language.entityTypes.indexOf(selection.select('header').ps()) !== -1)
  const headerSelection = selection.select('header')
  const header = language ? language.createHeaderDom(headerSelection, transforms) : defaultHeader(headerSelection)
  const changes = selection.selectAll('change')
    .map(change => changeDom(change, transforms, tagsByName, options))

  return dom.create('div')
    .class('qm-changelog-entry')
    .add(dom.create('div').class('qm-changelog-entry-header').add(header))
    .add(dom.create('div').class('qm-changelog-entry-content').add(changes))
}

/* Creates a group of entries displayed as a collapsible */
function group (selection, transforms, options, tagsByName, tagNames) {
  const link = selection.has('link') ?
    linkEntity('qm-changelog-group-link', selection.select('link').ps(), selection.ps()) :
    undefined

  const title = dom.create('div')
    .class('qm-changelog-group-title')
    .add(link || selection.ps())

  const entryEntities = selection.selectAll('entry').sort(utils.compareEntrySelections)

  const topLevelChanges = selection.selectAll('change')
    .map(change => {
      return dom.create('div')
        .class('qm-changelog-entry')
        .add(changeDom(change, transforms, tagsByName, options))
    })

  const entries = dom.create('div').class('qm-changelog-group-entries')
    .add(topLevelChanges)
    .add(entryEntities.map(ent => entry(ent, transforms, options, tagsByName)))

  const labels = dom.create('div').class('qm-changelog-group-labels')
    .add(options.tags.map(tag => {
      const topLevelCount = selection.selectAll('change').reduce((acc, change) => {
        return change.param(0) === tag.entityType ? acc + 1 : acc
      }, 0)
      const entrySubCount = entryEntities.reduce((total, entry) => {
        const subtotal = entry.selectAll('change').reduce((acc, change) => {
          return change.param(0) === tag.entityType ? acc + 1 : acc
        }, 0)
        return total + subtotal
      }, 0)
      const count = topLevelCount + entrySubCount
      return count > 0 ? label(tag, count) : undefined
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
  const tagsByName = {}
  const tagNames = []
  options.tags.forEach(tag => {
    tagsByName[tag.entityType] = tag
    tagNames.push(tag.entityType)
  })

  const description = selection.has('description') ?
    wrappedParagraph('qm-changelog-description', selection.select('description'), transforms) :
    undefined

  const groups = selection.selectAll('group')
    .map(grp => group(grp, transforms, options, tagsByName, tagNames))

  const entries = selection.selectAll('entry')
    .map(ent => entry(ent, transforms, options, tagsByName))

  if (description || groups.length > 0 || entries.length > 0) {
    const link = selection.has('link') ?
      linkEntity('qm-changelog-link', selection.select('link').ps(), selection.ps()) :
      undefined

    const title = link || selection.ps()

    return dom.create('div').class('qm-changelog')
      .add(dom.asset({
        url: '/assets/quantum-changelog.css',
        file: path.join(__dirname, '../assets/quantum-changelog.css')
      }))
      // XXX: get this from the options
      .add(dom.asset({
        url: '/assets/quantum-changelog/languages/javascript.css',
        file: path.join(__dirname, '../assets/languages/quantum-changelog-javascript.css')
      }))
      .add(dom.asset({
        url: '/assets/quantum-changelog.js',
        file: path.join(__dirname, '../assets/quantum-changelog.js')
      }))
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
  const resolvedOptions = merge(defaultConfig, options)

  return Object.freeze({
    changelog: (selection, transforms) => changelog(selection, transforms, resolvedOptions),
    changelogList: changelogList
  })
}

module.exports = transforms

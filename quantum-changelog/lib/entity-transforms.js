'use strict'

/*
  This file defines the entity transforms for the changelog module. There
  are three transforms:

    @changelog
    @wrapper
    @key

  The @changelog entity is for a single version. Meaning, to document the changes
  to a single api there will be multiple @changelog entries. (The @wrapper entity
  helps with this, see details below). The @changelog entity has a description and entries.

  Entries (@entry) within a changelog can be grouped using @group. For example,
  this is used in hexagon to split up changes by module in the master changelog.
  Groups are displayed in collapsibles and have a summary of the additions,
  removals, updates, etc in the header of the collapsible.
*/

const quantum = require('quantum-js')
const Promise = require('bluebird')
const merge = require('merge')
const dom = require('quantum-dom')
const path = require('path')
const html = require('quantum-html')

// XXX: This should come from the config
const javascript = require('./languages/javascript')
const css = require('./languages/css')

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

function createHeader (selection) {
  // console.log(selection)
  if (selection.has('header')) {
    const headerSelection = selection.select('header')

    const languages = [javascript, css]

    const language = languages.filter(language => language.entityTypes.indexOf(headerSelection.select('type').ps()) !== -1)[0]
    if (language) {
      return language.createHeader(headerSelection)
    }
  } else {
    return dom.create('span')
      .class('qm-changelog-entry-title')
      .text(selection.ps())
  }
}

/* Creates a single changelog entry */
function entry (selection, options, tagsByName, transforms) {
  const type = tagsByName[selection.type()]
  const icon = dom.create('i')
    .class(type.iconClass + ' ' + (type.textClass || 'qm-changelog-text-' + selection.type()))

  const issues = options.issueUrl && selection.has('issue') ?
    dom.create('span').class('qm-changelog-entry-issues')
      .add(selection.selectAll('issue').map((issue) => {
        return dom.create('a')
          .class('qm-changelog-entry-issue')
          .attr('href', options.issueUrl + issue.ps())
          .text('#' + issue.ps())
      })) : undefined

  const heading = dom.create('div').class('qm-changelog-entry-head')
    .add(createHeader(selection))
    .add(issues)

  const description = selection.has('description') ?
    wrappedParagraph('qm-changelog-entry-description', selection.select('description'), transforms) :
    undefined

  const body = (description) ? dom.create('div').class('qm-changelog-entry-body')
    .add(description) : undefined

  return dom.create('div').class('qm-changelog-entry')
    .add(dom.create('div').class('qm-changelog-entry-icon')
      .add(icon))
    .add(dom.create('div').class('qm-changelog-entry-content')
      .add(heading)
      .add(body))
}

/* Creates a group of entries displayed as a collapsible */
function group (selection, options, tagsByName, tagNames, transforms) {
  const link = selection.has('link') ?
    linkEntity('qm-changelog-group-link', selection.select('link').ps(), selection.ps()) :
    undefined

  const title = dom.create('div')
    .class('qm-changelog-group-title')
    .add(link || selection.ps())

  const entryEntities = selection.selectAll(tagNames)
  const entries = dom.create('div').class('qm-changelog-group-entries')
    .add(entryEntities.map(ent => entry(ent, options, tagsByName, transforms)))

  const labels = dom.create('div').class('qm-changelog-group-labels')
    .add(options.tags.map(tag => {
      const count = entryEntities.reduce((total, e) => {
        return e.type() === tag.entityType ? total + 1 : total
      }, 0)
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

function changelog (selection, options, transforms) {
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
    .map(grp => group(grp, options, tagsByName, tagNames, transforms))

  const entries = selection.selectAll(tagNames)
    .map(ent => entry(ent, options, tagsByName, transforms))

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

/* Generates the key that explains the tag icons */
function key (selection, options, transforms) {
  return dom.create('div').class('qm-changelog-key')
    .add(dom.create('div').class('qm-changelog-keys')
      .add(options.tags.map((tag) => {
        return dom.create('div').class('qm-changelog-key-item')
          .add(dom.create('div').class('qm-changelog-key-item-icon')
            .add(dom.create('i').class(tag.iconClass + ' qm-changelog-text-' + tag.entityType)))
          .add(dom.create('div').class('qm-changelog-key-item-text')
            .add(tag.displayName))
      })))
}

/*
  A wrapper for multiple @changelog entries. Also used by the page entry as a
  place to generate @changelog entries in.
*/
function wrapper (selection, transforms) {
  return dom.create('div').class('qm-changelog-wrapper')
    .add(selection.transform(transforms))
}

/* Factory for the entity transforms for changelog */
function transforms (options) {
  const resolvedOptions = merge(defaultConfig, options)

  return Object.freeze({
    key: (selection, transforms) => key(selection, resolvedOptions, transforms),
    changelog: (selection, transforms) => changelog(selection, resolvedOptions, transforms),
    wrapper: wrapper
  })
}

module.exports = transforms

'use strict'

function defaultDocsUrlLookup (version, api) {
  return {
    link: '/docs/' + version + '/' + api.split(' ').join('-').toLowerCase(),
    text: 'Docs'
  }
}

module.exports = {
  namespace: 'changelog',
  targetVersions: undefined, // Target array of versions, used to exclude versions from the list.

  // XXX: these will be replaced by the 'languages' option
  // XXX: what does an element being 'tagged' mean - explain this better
  taggable: [ // Elements that can be tagged and should be indexed
    'function',
    'prototype',
    'method',
    'property',
    'object',
    'constructor',
    'returns',
    'event',
    'data',
    'class',
    'extraclass',
    'childclass'
  ],
  // XXX: what does an element being 'indexed' mean - think of a more descriptive name
  indexable: [ // Elements that can't be tagged but should be indexed
    'param',
    'group'
  ],

  reverseVisibleList: false, // Whether the list of items should be shown in the order provided or reversed. Default reversed.

  // XXX: decide if these should be in here - or should rely on template? Template is probably the better option
  dontAddDocsLink: false, // Whether docs links should be ignored and the docsUrlLookup should not be run
  milestoneUrl: '',
  issueUrl: '',
  docsUrlLookup: defaultDocsUrlLookup, // The lookup for urls from a changelog to a docs page
  tags: [
    // XXX: remove the dependence on font awesome
    { entityType: 'info', displayName: 'Information', iconClass: 'fa fa-fw fa-info' },
    { entityType: 'docs', displayName: 'Documentation', iconClass: 'fa fa-fw fa-book' },
    { entityType: 'bugfix', displayName: 'Bug Fix', iconClass: 'fa fa-fw fa-bug' },
    { entityType: 'removed', displayName: 'Removed', iconClass: 'fa fa-fw fa-times' },
    { entityType: 'deprecated', displayName: 'Deprecated', iconClass: 'fa fa-fw fa-recycle' },
    { entityType: 'enhancement', displayName: 'Enhancement', iconClass: 'fa fa-fw fa-magic' },
    { entityType: 'updated', displayName: 'Updated', iconClass: 'fa fa-fw fa-level-up' },
    { entityType: 'added', displayName: 'Added', iconClass: 'fa fa-fw fa-plus' }
  ]
}

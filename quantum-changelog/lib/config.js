'use strict'

// function defaultModuleLookup (version, api) {
//   return {
//     link: '/docs/' + version + '/' + api.split(' ').join('-').toLowerCase(),
//     text: 'Docs'
//   }
// }

module.exports = {
  namespace: 'changelog',
  targetVersions: undefined, // Target array of versions, used to exclude versions from the list.

  reverseVisibleList: false, // Whether the list of items should be shown in the order provided or reversed. Default reversed.

  dontAddDocsLink: false, // Whether docs links should be ignored and the moduleUrlLookup should not be run
  milestoneUrlLookup: undefined,
  issueUrlLookup: undefined,
  moduleUrlLookup: undefined, // The lookup for urls from a changelog to a docs page

  // XXX: Change this to an object (any ordering is decided by changelog)
  tags: [
    // XXX: remove the dependence on font awesome
    { entityType: 'info', displayName: 'Information', iconClass: 'fa fa-fw fa-info' },
    { entityType: 'docs', displayName: 'Documentation', iconClass: 'fa fa-fw fa-book' },
    { entityType: 'bugfix', displayName: 'Bug Fix', iconClass: 'fa fa-fw fa-bug' },
    { entityType: 'removed', displayName: 'Removed', iconClass: 'fa fa-fw fa-times' },
    { entityType: 'deprecated', displayName: 'Deprecation', iconClass: 'fa fa-fw fa-recycle' },
    { entityType: 'enhancement', displayName: 'Enhancement', iconClass: 'fa fa-fw fa-magic' },
    { entityType: 'updated', displayName: 'Update', iconClass: 'fa fa-fw fa-level-up' },
    { entityType: 'added', displayName: 'Added', iconClass: 'fa fa-fw fa-plus' }
  ]
}

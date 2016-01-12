function defaultDocsUrlLookup (version, api) {
  return {
    link: path.join('/', 'docs', version, api.split(' ').join('-').toLowerCase()),
    text: 'Docs'
  }
}

module.exports = {
  namespace: 'changelog',
  targetVersions: undefined, // Target array of versions, used to exclude versions from the list.
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
  indexable: [ // Elements that can't be tagged but should be indexed
    'param',
    'group'
  ],
  reverseVisibleList: false, // Whether the list of items should be shown in the order provided or reversed. Default reversed.
  dontAddDocsLink: false, // Whether docs links should be ignored and the docsUrlLookup should not be run
  renderSingleItemInRoot: false, // Whether changelogs with a single item should render the entries in the root of that changelog
  milestoneUrl: '',
  issueUrl: '',
  docsUrlLookup: defaultDocsUrlLookup, // The lookup for urls from a changelog to a docs page
  tags: {
    added: {
      keyText: 'Added', // The text for the key
      iconClass: 'fa fa-fw fa-plus', // The class for the icon
      order: 8 // The order to display tagged content in
    },
    updated: {
      keyText: 'Updated',
      iconClass: 'fa fa-fw fa-level-up',
      order: 7
    },
    deprecated: {
      keyText: 'Deprecated',
      iconClass: 'fa fa-fw fa-recycle',
      order: 5
    },
    removed: {
      keyText: 'Removed',
      iconClass: 'fa fa-fw fa-times',
      order: 4
    },
    enhancement: {
      keyText: 'Enhancement',
      iconClass: 'fa fa-fw fa-magic',
      order: 6
    },
    bugfix: {
      keyText: 'Bug Fix',
      iconClass: 'fa fa-fw fa-bug',
      order: 3
    },
    docs: {
      keyText: 'Documentation',
      iconClass: 'fa fa-fw fa-book',
      order: 2
    },
    info: {
      keyText: 'Information',
      iconClass: 'fa fa-fw fa-info',
      order: 1
    }
  }
}

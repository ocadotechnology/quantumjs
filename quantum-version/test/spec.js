'use strict'

const chai = require('chai')
const quantum = require('quantum-js')
const lib = require('../lib/lib')

const should = chai.should()

const File = quantum.File
const FileInfo = quantum.FileInfo

describe('resolveOptions', () => {
  it('should return an object', () => {
    lib.resolveOptions().should.be.an('object')
  })
})

describe('defaultFilenameModifier', () => {
  it('should add a version number to the filename', () => {
    const fileInfo = new FileInfo({
      dest: 'test.um'
    })
    const version = '0.1.0'

    lib.defaultFilenameModifier(fileInfo, version).should.eql(new FileInfo({
      dest: 'test/0.1.0.um'
    }))
  })

  it('should do special handling for index files', () => {
    const fileInfo = new FileInfo({
      dest: 'test/index.um'
    })
    const version = '0.1.0'

    lib.defaultFilenameModifier(fileInfo, version).should.eql(new FileInfo({
      dest: 'test/0.1.0/index.um'
    }))
  })
})

describe('versionTransform', () => {
  it('should do nothing if there is no @versionedPage entity', () => {
    const file = new File({
      info: new FileInfo({
        dest: 'test.um'
      }),
      content: {
        type: '',
        params: [],
        content: []
      }
    })

    lib.fileTransform()(file).length.should.equal(1)
    lib.fileTransform()(file)[0].should.equal(file)
  })

  describe('options', () => {
    const file = new File({
      info: new FileInfo({
        dest: 'test.um'
      }),
      content: {
        type: '',
        params: [],
        content: [
          {
            type: 'versionedPage',
            params: [],
            content: [
              {
                type: 'version',
                params: ['1.0.0'],
                content: []
              },
              {
                type: 'version',
                params: ['2.0.0'],
                content: []
              }
            ]
          }
        ]
      }
    })

    it('defaults', () => {
      const tranformedFiles = lib.fileTransform()(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test/2.0.0.um',
        'test.um'
      ])
    })

    it('outputLatest: false', () => {
      const tranformedFiles = lib.fileTransform({outputLatest: false})(file)
      tranformedFiles.length.should.equal(2)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test/2.0.0.um'
      ])
    })

    it('outputLatest: true', () => {
      const tranformedFiles = lib.fileTransform({outputLatest: true})(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test/2.0.0.um',
        'test.um'
      ])
    })

    it('versions: [...]', () => {
      const tranformedFiles = lib.fileTransform({versions: ['1.0.0']})(file)
      tranformedFiles.length.should.equal(2)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '1.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test.um'
      ])
    })

    it('filenameModifier: function() {...}', () => {
      function filenameModifier (fileInfo, version) {
        return fileInfo.clone({
          dest: fileInfo.dest + '-' + version
        })
      }
      const tranformedFiles = lib.fileTransform({filenameModifier})(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test.um-1.0.0',
        'test.um-2.0.0',
        'test.um'
      ])
    })
  })
})

describe('versionList', () => {
  const file = new File({
    info: new FileInfo({
      dest: 'test.um'
    }),
    content: {
      type: '',
      params: [],
      content: [
        {
          type: 'versionedPage',
          params: [],
          content: [
            {
              type: 'version',
              params: ['1.0.0'],
              content: []
            },
            {
              type: 'version',
              params: ['2.0.0'],
              content: []
            }
          ]
        },
        { type: 'div', params: [], content: [] },
        { type: 'versionList', params: [], content: [] },
        {
          type: 'div',
          params: [],
          content: [
            { type: 'versionList', params: [], content: [] }
          ]
        }
      ]
    }
  })

  it('should populate multiple versionLists', () => {
    const tranformedFiles = lib.fileTransform()(file)
    tranformedFiles.length.should.equal(3)
    tranformedFiles
      .map(p => quantum.select(p.content))
      .map(selection => selection.selectAll('versionList', {recursive: true}))
      .map((versionLists, i) => {
        const versions = ['1.0.0', '2.0.0', '2.0.0']
        const currentVersion = versions[i]
        versionLists.length.should.equal(2)
        versionLists.forEach(versionList => {
          versionList.select('current').ps().should.equal(currentVersion)
          versionList.selectAll('version').map(v => v.ps()).should.eql(['1.0.0', '2.0.0'])
        })
      })
  })

  it('should populate multiple versionLists (override versions in options)', () => {
    const tranformedFiles = lib.fileTransform({versions: ['1.0.0']})(file)
    tranformedFiles.length.should.equal(2)
    tranformedFiles
      .map(p => quantum.select(p.content))
      .map(selection => selection.selectAll('versionList', {recursive: true}))
      .map((versionLists, i) => {
        const versions = ['1.0.0', '1.0.0']
        const currentVersion = versions[i]
        versionLists.length.should.equal(2)
        versionLists.forEach(versionList => {
          versionList.select('current').ps().should.equal(currentVersion)
          versionList.selectAll('version').map(v => v.ps()).should.eql(['1.0.0'])
        })
      })
  })
})

describe('mostRecentVersion', () => {
  it('should work when versions all line up (vanilla case)', () => {
    const version = '0.2.0'
    const candidateVersions = ['0.1.0', '0.2.0', '0.3.0']
    const targetVersions = ['0.1.0', '0.2.0', '0.3.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = lib.mostRecentVersion(version, candidateVersionSelections, targetVersions)
    selectedVersion.ps().should.eql('0.2.0')
  })

  it('should pick the most recent, when there is a version missing', () => {
    const version = '0.2.0'
    const candidateVersions = ['0.1.0', '0.3.0']
    const targetVersions = ['0.1.0', '0.2.0', '0.3.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = lib.mostRecentVersion(version, candidateVersionSelections, targetVersions)
    selectedVersion.ps().should.eql('0.1.0')
  })

  it('should pick the most recent, when out of range of the candidate versions', () => {
    const version = '0.4.0'
    const candidateVersions = ['0.1.0', '0.3.0']
    const targetVersions = ['0.1.0', '0.2.0', '0.3.0', '0.4.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = lib.mostRecentVersion(version, candidateVersionSelections, targetVersions)
    selectedVersion.ps().should.eql('0.3.0')
  })

  it('should return undefined when before any of the candidate versions', () => {
    const version = '0.1.0'
    const candidateVersions = ['0.3.0', '0.4.0']
    const targetVersions = ['0.1.0', '0.3.0', '0.4.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = lib.mostRecentVersion(version, candidateVersionSelections, targetVersions)
    should.not.exist(selectedVersion)
  })

  it('should return undefined when there are no candidateVersions', () => {
    const version = '0.1.0'
    const candidateVersions = []
    const targetVersions = ['0.1.0', '0.3.0', '0.4.0']

    const candidateVersionSelections = candidateVersions.map(v => {
      return quantum.select({
        type: 'version',
        params: [v],
        content: []
      })
    })

    const selectedVersion = lib.mostRecentVersion(version, candidateVersionSelections, targetVersions)
    should.not.exist(selectedVersion)
  })
})

describe('versioned', () => {
  const versionedPage = {
    type: 'versionedPage',
    params: [],
    content: [
      {
        type: 'version',
        params: ['1.0.0'],
        content: []
      },
      {
        type: 'version',
        params: ['2.0.0'],
        content: []
      },
      {
        type: 'version',
        params: ['3.0.0'],
        content: []
      }
    ]
  }
  const before = { type: 'before', params: [], content: [] }
  const after = { type: 'after', params: [], content: [] }

  const file = new File({
    info: new FileInfo({
      dest: 'test.um'
    }),
    content: {
      type: '',
      params: [],
      content: [
        versionedPage,
        before,
        {
          type: 'versioned',
          params: [],
          content: [
            {
              type: 'version',
              params: ['1.0.0'],
              content: ['Version 1']
            },
            {
              type: 'version',
              params: ['2.0.0'],
              content: ['Version 2']
            }
          ]
        },
        after,
        {
          type: 'div',
          params: [],
          content: [
            {
              type: 'versioned',
              params: [],
              content: [
                {
                  type: 'version',
                  params: ['2.0.0'],
                  content: [
                    { type: 'v2', params: [], content: [] }
                  ]
                },
                {
                  type: 'version',
                  params: ['3.0.0'],
                  content: [
                    { type: 'v3', params: [], content: [] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  })

  it('should populate multiple versioned sections', () => {
    const tranformedFiles = lib.fileTransform({outputLatest: false})(file)
    tranformedFiles.length.should.equal(3)
    tranformedFiles
      .map(p => quantum.select(p.content))
      .map(selection => selection.content())
      .should.eql([
        [
          versionedPage,
          before,
          'Version 1',
          after,
          {
            type: 'div',
            params: [],
            content: []
          }
        ],
        [
          versionedPage,
          before,
          'Version 2',
          after,
          {
            type: 'div',
            params: [],
            content: [
              { type: 'v2', params: [], content: [] }
            ]
          }
        ],
        [
          versionedPage,
          before,
          'Version 2',
          after,
          {
            type: 'div',
            params: [],
            content: [
              { type: 'v3', params: [], content: [] }
            ]
          }
        ]
      ])
  })
})

describe('tags', () => {
  const file = new File({
    info: new FileInfo({
      dest: 'test.um'
    }),
    content: {
      type: '',
      params: [],
      content: [
        {
          type: 'versionedPage',
          params: [],
          content: [
            { type: 'version', params: ['1.0.0'], content: [] },
            { type: 'version', params: ['2.0.0'], content: [] },
            { type: 'version', params: ['3.0.0'], content: [] },
            { type: 'version', params: ['4.0.0'], content: [] },
            { type: 'version', params: ['5.0.0'], content: [] },
            { type: 'version', params: ['6.0.0'], content: [] },
            { type: 'version', params: ['7.0.0'], content: [] },
            { type: 'version', params: ['8.0.0'], content: [] }
          ]
        },
        { type: 'before', params: [], content: [] },
        {
          type: 'function',
          params: ['name'],
          content: [
            { type: 'added', params: ['2.0.0'], content: [] },
            { type: 'updated', params: ['4.0.0'], content: [] },
            { type: 'deprecated', params: ['5.0.0'], content: [] },
            { type: 'removed', params: ['7.0.0'], content: [] },
            { type: 'updated', params: ['9.0.0'], content: [] }
          ]
        },
        { type: 'after', params: [], content: [] }
      ]
    }
  })

  it('should do the complete flow for the tags', () => {
    const tranformedFiles = lib.fileTransform({outputLatest: false})(file)
    tranformedFiles.length.should.equal(8)

    // Every transformed file should have a warning about version 9.0.0 being used
    tranformedFiles.forEach(file => {
      file.warnings.should.eql([{
        module: 'quantum-version',
        problem: 'Unexpected version "9.0.0" found in @updated',
        resolution: 'Correct the versions list, or the tag version. The versions list for this page is [1.0.0, 2.0.0, 3.0.0, 4.0.0, 5.0.0, 6.0.0, 7.0.0, 8.0.0]'
      }])
    })

    // Version 1.0.0 (no function added yet)
    quantum.select(tranformedFiles[0].content).has('function').should.equal(false)
    quantum.select(tranformedFiles[0].content).select('function').has('added').should.equal(false)
    quantum.select(tranformedFiles[0].content).select('function').has('updated').should.equal(false)
    quantum.select(tranformedFiles[0].content).select('function').has('deprecated').should.equal(false)
    quantum.select(tranformedFiles[0].content).select('function').has('removed').should.equal(false)

    // Version 2.0.0 (function added)
    quantum.select(tranformedFiles[1].content).has('function').should.equal(true)
    quantum.select(tranformedFiles[1].content).select('function').has('added').should.equal(true)
    quantum.select(tranformedFiles[1].content).select('function').has('updated').should.equal(false)
    quantum.select(tranformedFiles[1].content).select('function').has('deprecated').should.equal(false)
    quantum.select(tranformedFiles[1].content).select('function').has('removed').should.equal(false)

    // Version 3.0.0 (function remains the same, added tag has been removed)
    quantum.select(tranformedFiles[2].content).has('function').should.equal(true)
    quantum.select(tranformedFiles[2].content).select('function').has('added').should.equal(false)
    quantum.select(tranformedFiles[2].content).select('function').has('updated').should.equal(false)
    quantum.select(tranformedFiles[2].content).select('function').has('deprecated').should.equal(false)
    quantum.select(tranformedFiles[2].content).select('function').has('removed').should.equal(false)

    // Version 4.0.0 (updated tag added to version)
    quantum.select(tranformedFiles[3].content).has('function').should.equal(true)
    quantum.select(tranformedFiles[3].content).select('function').has('added').should.equal(false)
    quantum.select(tranformedFiles[3].content).select('function').has('updated').should.equal(true)
    quantum.select(tranformedFiles[3].content).select('function').has('deprecated').should.equal(false)
    quantum.select(tranformedFiles[3].content).select('function').has('removed').should.equal(false)

    // Version 5.0.0 (function becomes deprecated, updated tag has been removed)
    quantum.select(tranformedFiles[4].content).has('function').should.equal(true)
    quantum.select(tranformedFiles[4].content).select('function').has('added').should.equal(false)
    quantum.select(tranformedFiles[4].content).select('function').has('updated').should.equal(false)
    quantum.select(tranformedFiles[4].content).select('function').has('deprecated').should.equal(true)
    quantum.select(tranformedFiles[4].content).select('function').has('removed').should.equal(false)

    // Version 6.0.0 (function remains the same, deprecated tag is retained)
    quantum.select(tranformedFiles[5].content).has('function').should.equal(true)
    quantum.select(tranformedFiles[5].content).select('function').has('added').should.equal(false)
    quantum.select(tranformedFiles[5].content).select('function').has('updated').should.equal(false)
    quantum.select(tranformedFiles[5].content).select('function').has('deprecated').should.equal(true)
    quantum.select(tranformedFiles[4].content).select('function').has('removed').should.equal(false)

    // Version 7.0.0 (function is tagged as removed, deprecated tag is removed)
    quantum.select(tranformedFiles[6].content).has('function').should.equal(true)
    quantum.select(tranformedFiles[6].content).select('function').has('added').should.equal(false)
    quantum.select(tranformedFiles[6].content).select('function').has('updated').should.equal(false)
    quantum.select(tranformedFiles[6].content).select('function').has('deprecated').should.equal(false)
    quantum.select(tranformedFiles[6].content).select('function').has('removed').should.equal(true)

    // Version 8.0.0 (function fully removed)
    quantum.select(tranformedFiles[7].content).has('function').should.equal(false)
  })
})

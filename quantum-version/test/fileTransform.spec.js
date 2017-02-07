describe('fileTransform', () => {
  const { select, File, FileInfo } = require('quantum-js')
  const { fileTransform } = require('..')
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

    fileTransform()(file).length.should.equal(1)
    fileTransform()(file)[0].should.equal(file)
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
      const tranformedFiles = fileTransform()(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test/2.0.0.um',
        'test.um'
      ])
    })

    it('outputLatest: false', () => {
      const tranformedFiles = fileTransform({outputLatest: false})(file)
      tranformedFiles.length.should.equal(2)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test/2.0.0.um'
      ])
    })

    it('outputLatest: true', () => {
      const tranformedFiles = fileTransform({outputLatest: true})(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test/1.0.0.um',
        'test/2.0.0.um',
        'test.um'
      ])
    })

    it('versions: [...]', () => {
      const tranformedFiles = fileTransform({versions: ['1.0.0']})(file)
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
      const tranformedFiles = fileTransform({filenameModifier})(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles.map(p => p.meta.version).should.eql(['1.0.0', '2.0.0', '2.0.0'])
      tranformedFiles.map(p => p.info.dest).should.eql([
        'test.um-1.0.0',
        'test.um-2.0.0',
        'test.um'
      ])
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
      const tranformedFiles = fileTransform()(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles
        .map(p => select(p.content))
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
      const tranformedFiles = fileTransform({versions: ['1.0.0']})(file)
      tranformedFiles.length.should.equal(2)
      tranformedFiles
        .map(p => select(p.content))
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
      const tranformedFiles = fileTransform({outputLatest: false})(file)
      tranformedFiles.length.should.equal(3)
      tranformedFiles
        .map(p => select(p.content))
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
      const tranformedFiles = fileTransform({outputLatest: false})(file)
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
      select(tranformedFiles[0].content).has('function').should.equal(false)
      select(tranformedFiles[0].content).select('function').has('added').should.equal(false)
      select(tranformedFiles[0].content).select('function').has('updated').should.equal(false)
      select(tranformedFiles[0].content).select('function').has('deprecated').should.equal(false)
      select(tranformedFiles[0].content).select('function').has('removed').should.equal(false)

      // Version 2.0.0 (function added)
      select(tranformedFiles[1].content).has('function').should.equal(true)
      select(tranformedFiles[1].content).select('function').has('added').should.equal(true)
      select(tranformedFiles[1].content).select('function').has('updated').should.equal(false)
      select(tranformedFiles[1].content).select('function').has('deprecated').should.equal(false)
      select(tranformedFiles[1].content).select('function').has('removed').should.equal(false)

      // Version 3.0.0 (function remains the same, added tag has been removed)
      select(tranformedFiles[2].content).has('function').should.equal(true)
      select(tranformedFiles[2].content).select('function').has('added').should.equal(false)
      select(tranformedFiles[2].content).select('function').has('updated').should.equal(false)
      select(tranformedFiles[2].content).select('function').has('deprecated').should.equal(false)
      select(tranformedFiles[2].content).select('function').has('removed').should.equal(false)

      // Version 4.0.0 (updated tag added to version)
      select(tranformedFiles[3].content).has('function').should.equal(true)
      select(tranformedFiles[3].content).select('function').has('added').should.equal(false)
      select(tranformedFiles[3].content).select('function').has('updated').should.equal(true)
      select(tranformedFiles[3].content).select('function').has('deprecated').should.equal(false)
      select(tranformedFiles[3].content).select('function').has('removed').should.equal(false)

      // Version 5.0.0 (function becomes deprecated, updated tag has been removed)
      select(tranformedFiles[4].content).has('function').should.equal(true)
      select(tranformedFiles[4].content).select('function').has('added').should.equal(false)
      select(tranformedFiles[4].content).select('function').has('updated').should.equal(false)
      select(tranformedFiles[4].content).select('function').has('deprecated').should.equal(true)
      select(tranformedFiles[4].content).select('function').has('removed').should.equal(false)

      // Version 6.0.0 (function remains the same, deprecated tag is retained)
      select(tranformedFiles[5].content).has('function').should.equal(true)
      select(tranformedFiles[5].content).select('function').has('added').should.equal(false)
      select(tranformedFiles[5].content).select('function').has('updated').should.equal(false)
      select(tranformedFiles[5].content).select('function').has('deprecated').should.equal(true)
      select(tranformedFiles[4].content).select('function').has('removed').should.equal(false)

      // Version 7.0.0 (function is tagged as removed, deprecated tag is removed)
      select(tranformedFiles[6].content).has('function').should.equal(true)
      select(tranformedFiles[6].content).select('function').has('added').should.equal(false)
      select(tranformedFiles[6].content).select('function').has('updated').should.equal(false)
      select(tranformedFiles[6].content).select('function').has('deprecated').should.equal(false)
      select(tranformedFiles[6].content).select('function').has('removed').should.equal(true)

      // Version 8.0.0 (function fully removed)
      select(tranformedFiles[7].content).has('function').should.equal(false)
    })
  })
})

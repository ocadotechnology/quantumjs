describe('fileTransform (changelog)', () => {
  const quantum = require('quantum-js')
  const { fileTransform } = require('../../lib/file-transforms/changelog')

  const testlanguage = {
    name: 'test-language-1',
    changelogHeaderTransforms: {
      function: () => {}
    }
  }

  it('does nothing when there is no @changelogList', () => {
    const file = new quantum.File({
      info: new quantum.FileInfo({
        src: 'src/content/a1.um',
        resolved: 'a1.um',
        base: 'src/content',
        dest: 'target/a1.um',
        watch: true
      }),
      content: {
        type: '',
        params: [],
        content: []
      }
    })
    fileTransform(file).should.eql(file)
  })

  it('processes a page when a @changelogList is found', () => {
    const page = new quantum.File({
      info: new quantum.FileInfo({
        src: 'src/content/a1.um',
        resolved: 'a1.um',
        base: 'src/content',
        dest: 'target/a1.um',
        watch: true
      }),
      content: {
        type: '',
        params: [],
        content: [
          {
            type: 'changelogList',
            params: [],
            content: []
          }
        ]
      }
    })

    const options = {
      languages: [testlanguage],
      changelogGroupByApi: true,
      changelogReverseVisibleList: true
    }

    fileTransform(page, options).should.not.equal(page)
    fileTransform(page, options).should.be.an.instanceof(quantum.File)
  })
})

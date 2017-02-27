describe('fileTransform', () => {
  const quantum = require('quantum-js')
  const path = require('path')
  const api = require('..')
  it('does nothing when options.processChangelogs is false', () => {
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
        content: [
          {
            type: 'changelogList',
            params: [],
            content: []
          }
        ]
      }
    })
    api.fileTransform({processChangelogs: false})(file).should.eql(file)
  })

  const testLanguage = {
    name: 'test-language-1',
    changelog: {
      entityTypes: [
        'function'
      ],
      createHeaderDom: () => {}
    }
  }

  function checkSpec (spec) {
    const fileInfo = new quantum.FileInfo({
      src: 'src/content/a1.um',
      resolved: 'a1.um',
      base: 'src/content',
      dest: 'target/a1.um',
      watch: true
    })

    const inputFile = new quantum.File({
      info: fileInfo,
      content: {
        type: '',
        params: [],
        content: spec.select('input').content()
      }
    })

    const outputFile = new quantum.File({
      info: fileInfo,
      content: {
        type: '',
        params: [],
        content: spec.select('output').content()
      }
    })

    const options = {
      languages: [testLanguage],
      changelogGroupByApi: spec.select('options').select('groupByApi').ps() === 'true',
      changelogReverseVisibleList: spec.select('options').select('reverseVisibleList').ps() === 'true'
    }

    api.fileTransform(options)(inputFile).should.eql(outputFile)
  }

  it('fileTransform.spec.um', () => {
    return quantum.read(path.join(__dirname, 'files/fileTransform.spec.um'))
      .then(parsed => {
        quantum.select(parsed)
          .selectAll('spec')
          .forEach(checkSpec)
      })
  })
})

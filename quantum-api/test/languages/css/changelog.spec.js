describe('changelog', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const css = require('../../../lib/languages/css')

  it('exports the correct things', () => {
    const options = {}
    const cssChangelog = css(options).changelog
    cssChangelog.should.have.keys([
      'entityTypes',
      'createHeaderDom'
    ])
    cssChangelog.entityTypes.should.be.an('array')
    cssChangelog.createHeaderDom.should.be.a('function')
  })

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
      languages: [css()]
    }

    changelogFileTransform.fileTransform(inputFile, options).should.eql(outputFile)
  }

  describe('examples', () => {
    function testExample (filename) {
      it(filename, () => {
        return quantum.read(path.join(__dirname, filename))
          .then(parsed => {
            checkSpec(quantum.select(parsed).select('spec'))
          })
      })
    }

    testExample('examples/class-basic.um')
    testExample('examples/class-nested.um')
    testExample('examples/extraclass-basic.um')
    testExample('examples/extraclass-nested.um')
  })
})

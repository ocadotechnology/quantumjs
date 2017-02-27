describe('changelog', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const javascript = require('../../../lib/languages/javascript')

  describe('examples', () => {
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
        languages: [javascript()]
      }

      changelogFileTransform.fileTransform(inputFile, options).should.eql(outputFile)
    }

    function testExample (filename) {
      it(filename, () => {
        return quantum.read(path.join(__dirname, filename))
          .then(parsed => {
            checkSpec(quantum.select(parsed).select('spec'))
          })
      })
    }

    testExample('examples/function-basic.um')
    testExample('examples/function-return-type-change.um')
    testExample('examples/function-no-return.um')
    testExample('examples/method-basic.um')
    testExample('examples/constructor-basic.um')
    testExample('examples/object-basic.um')
    testExample('examples/property-basic.um')
    testExample('examples/event-basic.um')
    testExample('examples/prototype-basic.um')
    testExample('examples/property-on-object.um')
  })
})

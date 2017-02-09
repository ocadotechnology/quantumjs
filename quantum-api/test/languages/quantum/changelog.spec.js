describe('changelog', () => {
  const path = require('path')
  const { File, FileInfo, read, select } = require('quantum-js')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const quantum = require('../../../lib/languages/quantum')

  describe('changelogHeaderTransforms', () => {
    const { changelogHeaderTransforms } = quantum()
    const keys = [
      'entity',
      'param'
    ]
    it('has the right properties', () => {
      changelogHeaderTransforms.should.have.keys(keys)
    })
    keys.forEach(k => {
      it(`'${k}' looks like a transform`, () => {
        changelogHeaderTransforms[k].should.be.a('function')
        changelogHeaderTransforms[k].length.should.equal(2)
      })
    })
  })

  function checkSpec (spec) {
    const fileInfo = new FileInfo({
      src: 'src/content/a1.um',
      resolved: 'a1.um',
      base: 'src/content',
      dest: 'target/a1.um',
      watch: true
    })

    const inputFile = new File({
      info: fileInfo,
      content: {
        type: '',
        params: [],
        content: spec.select('input').content()
      }
    })

    const outputFile = new File({
      info: fileInfo,
      content: {
        type: '',
        params: [],
        content: spec.select('output').content()
      }
    })

    const options = {
      languages: [quantum()]
    }

    changelogFileTransform.fileTransform(inputFile, options).should.eql(outputFile)
  }

  describe('examples', () => {
    function testExample (filename) {
      it(filename, () => {
        return read(path.join(__dirname, filename))
          .then(parsed => {
            checkSpec(select(parsed).select('spec'))
          })
      })
    }

    testExample('examples/entity.um')
    testExample('examples/param.um')
  })
})

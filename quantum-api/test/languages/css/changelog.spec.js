describe('changelog', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/builders/header')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const css = require('../../../lib/languages/css')

  function transformer () {}

  describe('changelogHeaderTransforms', () => {
    const { changelogHeaderTransforms } = css()
    const keys = [
      'class',
      'extraClass',
      'parent'
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

    const typesThatUseNameHeader = [
      'class',
      'extraClass'
    ]
    const classesForHeaders = [
      'class',
      'extra-class'
    ]

    typesThatUseNameHeader.forEach((entityType, index) => {
      describe(entityType, () => {
        it('renders correctly', () => {
          function testPropertHeaderDetails (selection) {
            return dom.create('span')
              .class(`qm-api-css-header-name`)
              .attr('id', 'someprop')
              .add('someProp')
          }
          const selection = quantum.select({
            type: entityType,
            params: ['someProp', 'Type'],
            content: []
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(
            header(classesForHeaders[index], testPropertHeaderDetails)(selection, transformer))
        })

        it('handles not having params', () => {
          function testPropertHeaderDetails (selection) {
            return dom.create('span')
              .class(`qm-api-css-header-name`)
          }
          const selection = quantum.select({
            type: entityType,
            params: [],
            content: []
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(
            header(classesForHeaders[index], testPropertHeaderDetails)(selection, transformer))
        })
      })
    })

    describe('parent', () => {
      it('renders correctly', () => {
        function testPropertHeaderDetails (selection) {
          return dom.create('span')
            .class('qm-api-css-header-parent')
            .attr('id', 'someprop')
            .add(dom.create('span').class('qm-api-css-header-parent-name').text('someProp'))
        }
        const selection = quantum.select({
          type: 'anything',
          params: ['someProp', 'Type'],
          content: []
        })
        changelogHeaderTransforms.parent(selection, transformer).should.eql(
          header('parent', testPropertHeaderDetails)(selection, transformer))
      })

      it('handles not having params', () => {
        function testPropertHeaderDetails (selection) {
          return dom.create('span')
            .class('qm-api-css-header-parent')
            .add(dom.create('span').class('qm-api-css-header-parent-name').text(''))
        }
        const selection = quantum.select({
          type: 'anything',
          params: [],
          content: []
        })
        changelogHeaderTransforms.parent(selection, transformer).should.eql(
          header('parent', testPropertHeaderDetails)(selection, transformer))
      })
    })
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

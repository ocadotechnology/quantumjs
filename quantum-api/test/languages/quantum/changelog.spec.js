describe('changelog', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/builders/header')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const umLanguage = require('../../../lib/languages/quantum')

  describe('changelogHeaderTransforms', () => {
    const { changelogHeaderTransforms } = umLanguage()
    const keys = [
      'entity',
      'param',
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

    function transformer () {}

    describe('entity', () => {
      const { entity } = changelogHeaderTransforms
      it('renders correctly', () => {
        function testEntityDetails (selection) {
          return dom.create('span')
            .class('qm-api-quantum-header-entity-name')
            .attr('id', 'someentity')
            .add('someEntity')
        }
        const selection = quantum.select({
          type: 'entity',
          params: ['someEntity'],
          content: []
        })
        entity(selection, transformer).should.eql(header('entity', testEntityDetails)(selection, transformer))
      })

      it('renders @param correctly', () => {
        function testEntityDetails (selection) {
          return dom.create('span')
            .class('qm-api-quantum-header-entity-name')
            .attr('id', 'someentity')
            .add('someEntity')
            .add(dom.create('span').class('qm-api-quantum-header-entity-params')
              .add(dom.create('span')
                .class('qm-api-quantum-header-entity-param')
                .add(dom.create('span').class('qm-api-quantum-header-entity-param-name').text('param1')))
              .add(dom.create('span')
                .class('qm-api-quantum-header-entity-param qm-api-optional')
                .add(dom.create('span').class('qm-api-quantum-header-entity-param-name').text('param2'))))
        }
        const selection = quantum.select({
          type: 'entity',
          params: ['someEntity', 'Type'],
          content: [{
            type: 'param',
            params: ['param1'],
            content: []
          }, {
            type: 'param?',
            params: ['param2'],
            content: []
          }]
        })
        entity(selection, transformer).should.eql(header('entity', testEntityDetails)(selection, transformer))
      })

      it('handles no param string', () => {
        function testEntityDetails (selection) {
          return dom.create('span')
            .class('qm-api-quantum-header-entity-name')
            .add('')
        }
        const selection = quantum.select({
          type: 'entity',
          params: [],
          content: []
        })
        entity(selection, transformer).should.eql(header('entity', testEntityDetails)(selection, transformer))
      })
    })

    describe('param', () => {
      const { param } = changelogHeaderTransforms
      it('renders correctly', () => {
        function testParamDetails (selection) {
          return dom.create('span')
            .class('qm-api-quantum-header-param-name')
            .attr('id', 'someparam')
            .add('someParam')
        }
        const selection = quantum.select({
          type: 'param',
          params: ['someParam'],
          content: []
        })
        param(selection, transformer).should.eql(header('param', testParamDetails)(selection, transformer))
      })

      it('handles no params', () => {
        function testParamDetails (selection) {
          return dom.create('span')
            .class('qm-api-quantum-header-param-name')
            .add('')
        }
        const selection = quantum.select({
          type: 'param',
          params: [],
          content: []
        })
        param(selection, transformer).should.eql(header('param', testParamDetails)(selection, transformer))
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
      languages: [umLanguage()]
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

    testExample('examples/entity.um')
    testExample('examples/param.um')
  })
})

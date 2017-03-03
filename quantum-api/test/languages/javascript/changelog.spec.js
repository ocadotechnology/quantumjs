describe('changelog', () => {
  const path = require('path')
  const dom = require('quantum-dom')
  const quantum = require('quantum-js')
  const header = require('../../../lib/entity-transforms/builders/header')
  const type = require('../../../lib/entity-transforms/components/type')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const javascript = require('../../../lib/languages/javascript')

  const typeLinks = {}

  function transformer () {}

  describe('changelogHeaderTransforms', () => {
    const { changelogHeaderTransforms } = javascript({ typeLinks })
    const keys = [
      'object',
      'prototype',
      'event',
      'constructor',
      'function',
      'method',
      'property',
      'property?'
    ]

    it('has the right properties', () => {
      changelogHeaderTransforms.should.have.keys(keys)
    })

    keys.forEach(entityType => {
      it(`${entityType}' looks like a transform`, () => {
        changelogHeaderTransforms[entityType].should.be.a('function')
        changelogHeaderTransforms[entityType].length.should.equal(2)
      })
    })

    const typesThatUsePropertyHeader = [
      'property',
      'object',
      'event',
      'property?'
    ]

    typesThatUsePropertyHeader.forEach(entityType => {
      describe(entityType, () => {
        it('renders correctly', () => {
          function testPropertHeaderDetails (selection) {
            return dom.create('span')
              .class('qm-api-javascript-header-property')
              .attr('id', 'someprop')
              .add(dom.create('span').class('qm-api-javascript-header-property-name').text('someProp'))
              .add(dom.create('span').class('qm-api-javascript-header-property-type').add(type('Type', typeLinks)))
          }
          const selection = quantum.select({
            type: entityType,
            params: ['someProp', 'Type'],
            content: []
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(header('property', testPropertHeaderDetails)(selection, transformer))
        })

        it('handles not having params', () => {
          function testPropertHeaderDetails (selection) {
            return dom.create('span')
              .class('qm-api-javascript-header-property')
              .add(dom.create('span').class('qm-api-javascript-header-property-name').text(''))
              .add(dom.create('span').class('qm-api-javascript-header-property-type').add(type(undefined, typeLinks)))
          }
          const selection = quantum.select({
            type: entityType,
            params: [],
            content: []
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(header('property', testPropertHeaderDetails)(selection, transformer))
        })
      })
    })

    const typesThatUseFunctionHeader = [
      'function',
      'method',
      'constructor'
    ]

    typesThatUseFunctionHeader.forEach((entityType) => {
      describe(entityType, () => {
        it('renders correctly', () => {
          function testFunctionHeaderDetails (selection) {
            return dom.create('span').class('qm-api-javascript-header-function')
              .attr('id', entityType === 'constructor' ? undefined : 'somefunction')
              .add(dom.create('span').class('qm-api-javascript-header-function-name').text(entityType === 'constructor' ? 'constructor' : 'someFunction'))
              .add(dom.create('span').class('qm-api-javascript-header-function-params')
                .add(dom.create('span').class('qm-api-javascript-header-function-param')
                  .add(dom.create('span').class('qm-api-javascript-header-function-param-name').text('param1'))
                  .add(dom.create('span').class('qm-api-javascript-header-function-param-type').add(type('param1Type', typeLinks)))))
          }
          const selection = quantum.select({
            type: entityType,
            params: entityType === 'constructor' ? [] : ['someFunction'],
            content: [{
              type: 'param',
              params: ['param1', 'param1Type'],
              content: []
            }]
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(header('function', testFunctionHeaderDetails)(selection, transformer))
        })

        it('renders optional params correctly', () => {
          function testFunctionHeaderDetails (selection) {
            return dom.create('span').class('qm-api-javascript-header-function')
              .attr('id', entityType === 'constructor' ? undefined : 'somefunction')
              .add(dom.create('span').class('qm-api-javascript-header-function-name').text(entityType === 'constructor' ? 'constructor' : 'someFunction'))
              .add(dom.create('span').class('qm-api-javascript-header-function-params')
                .add(dom.create('span').class('qm-api-javascript-header-function-param qm-api-optional')
                  .add(dom.create('span').class('qm-api-javascript-header-function-param-name').text('param1'))
                  .add(dom.create('span').class('qm-api-javascript-header-function-param-type').add(type('param1Type', typeLinks)))))
          }
          const selection = quantum.select({
            type: entityType,
            params: entityType === 'constructor' ? [] : ['someFunction'],
            content: [{
              type: 'param?',
              params: ['param1', 'param1Type'],
              content: []
            }]
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(header('function', testFunctionHeaderDetails)(selection, transformer))
        })

        it('renders returns correctly', () => {
          function testFunctionHeaderDetails (selection) {
            return dom.create('span').class('qm-api-javascript-header-function')
              .attr('id', entityType === 'constructor' ? undefined : 'somefunction')
              .add(dom.create('span').class('qm-api-javascript-header-function-name').text(entityType === 'constructor' ? 'constructor' : 'someFunction'))
              .add(dom.create('span').class('qm-api-javascript-header-function-params')
                .add(dom.create('span').class('qm-api-javascript-header-function-param')
                  .add(dom.create('span').class('qm-api-javascript-header-function-param-name').text('param1'))
                  .add(dom.create('span').class('qm-api-javascript-header-function-param-type').add(type('param1Type', typeLinks)))))
              .add(dom.create('span').class('qm-api-javascript-header-function-returns').add(type('Type', typeLinks)))
          }
          const selection = quantum.select({
            type: entityType,
            params: entityType === 'constructor' ? [] : ['someFunction'],
            content: [{
              type: 'param',
              params: ['param1', 'param1Type'],
              content: []
            }, {
              type: 'returns',
              params: ['Type'],
              content: []
            }]
          })
          changelogHeaderTransforms[entityType](selection, transformer).should.eql(header('function', testFunctionHeaderDetails)(selection, transformer))
        })
      })
    })

    describe('prototype', () => {
      it('renders correctly', () => {
        const { prototype } = changelogHeaderTransforms
        function testPrototypeHeader (selection) {
          return dom.create('span')
            .class('qm-api-javascript-header-prototype')
            .attr('id', 'protoname1')
            .add(dom.create('span').class('qm-api-javascript-prototype-name').text('ProtoName1'))
        }
        const selection = quantum.select({
          type: 'prototype',
          params: ['ProtoName1'],
          content: []
        })
        prototype(selection, transformer).should.eql(header('prototype', testPrototypeHeader)(selection, transformer))
      })

      it('renders extended entites correctly', () => {
        const { prototype } = changelogHeaderTransforms
        function testPrototypeHeader (selection) {
          return dom.create('span')
            .class('qm-api-javascript-header-prototype')
            .attr('id', 'protoname1')
            .add(dom.create('span').class('qm-api-javascript-prototype-name').text('ProtoName1'))
            .add(dom.create('span').class('qm-api-javascript-prototype-extends').text('extends'))
            .add(dom.create('span').class('qm-api-javascript-prototype-extender').add(type('ProtoName2', typeLinks)))
        }
        const selection = quantum.select({
          type: 'prototype',
          params: ['ProtoName1'],
          content: [{
            type: 'extends',
            params: ['ProtoName2'],
            content: []
          }]
        })
        prototype(selection, transformer).should.eql(header('prototype', testPrototypeHeader)(selection, transformer))
      })

      it('handles not having params', () => {
        const { prototype } = changelogHeaderTransforms
        function testPrototypeHeader (selection) {
          return dom.create('span')
            .class('qm-api-javascript-header-prototype')
            .add(dom.create('span').class('qm-api-javascript-prototype-name').text(''))
        }
        const selection = quantum.select({
          type: 'prototype',
          params: [],
          content: []
        })
        prototype(selection, transformer).should.eql(header('prototype', testPrototypeHeader)(selection, transformer))
      })
    })
  })

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

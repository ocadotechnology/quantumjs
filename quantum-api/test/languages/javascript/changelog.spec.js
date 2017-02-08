describe('changelog', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const javascript = require('../../../lib/languages/javascript')

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
  describe('examples', () => {
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

  // describe('createHeaderDom', () => {
  //   function transform () {
  //     return dom.create('div')
  //   }

  //   it('should return undefined if there is no content', () => {
  //     const selection = quantum.select({
  //       type: 'header',
  //       params: ['javascript'],
  //       content: []
  //     })

  //     should.not.exist(javascript().changelog.createHeaderDom(selection, transform))
  //   })

  //   it('should return a virtual dom element', () => {
  //     const selection = quantum.select({
  //       type: 'header',
  //       params: ['javascript'],
  //       content: [
  //         {
  //           type: 'function',
  //           params: ['name'],
  //           content: []
  //         }
  //       ]
  //     })

  //     javascript().changelog.createHeaderDom(selection, transform).should.be.an.instanceof(dom.Element)
  //     javascript().changelog.createHeaderDom(selection, transform).class().should.equal('qm-changelog-javascript-header')
  //   })

  //   describe('should render object types correctly', () => {
  //     function test (type) {
  //       it(type, () => {
  //         const selection = quantum.select({
  //           type: 'header',
  //           params: ['javascript'],
  //           content: [
  //             {
  //               type: type,
  //               params: ['name'],
  //               content: []
  //             }
  //           ]
  //         })

  //         function transform () {
  //           return dom.create('div')
  //         }

  //         javascript().changelog.createHeaderDom(selection, transform).should.eql(
  //           dom.create('span').class('qm-changelog-javascript-header')
  //             .add(dom.create('span').class('qm-changelog-javascript-' + type)
  //               .add(dom.create('span').class('qm-changelog-javascript-name').text('name'))
  //             )
  //         )
  //       })
  //     }

  //     test('object')
  //     test('prototype')
  //   })

  //   describe('should render function types correctly', () => {
  //     function test (type) {
  //       it(type, () => {
  //         const selection = quantum.select({
  //           type: 'header',
  //           params: ['javascript'],
  //           content: [
  //             {
  //               type: type,
  //               params: ['name'],
  //               content: [
  //                 {
  //                   type: 'param',
  //                   params: ['param1', 'String'],
  //                   content: []
  //                 }
  //               ]
  //             }
  //           ]
  //         })

  //         function transform () {
  //           return dom.create('div')
  //         }

  //         javascript().changelog.createHeaderDom(selection, transform).should.eql(
  //           dom.create('span').class('qm-changelog-javascript-header')
  //             .add(dom.create('span').class('qm-changelog-javascript-' + type)
  //               .add(dom.create('span').class('qm-changelog-javascript-name').text('name'))
  //               .add(dom.create('span').class('qm-changelog-javascript-params')
  //                 .add(dom.create('span').class('qm-changelog-javascript-param')
  //                   .add(dom.create('span').class('qm-changelog-javascript-param-name').text('param1'))
  //                   .add(dom.create('span').class('qm-changelog-javascript-param-type').text('String')))))
  //         )
  //       })
  //     }

  //     test('function')
  //     test('method')
  //     test('constructor')
  //   })

  //   describe('should render property types correctly', () => {
  //     function test (type) {
  //       it(type, () => {
  //         const selection = quantum.select({
  //           type: 'header',
  //           params: ['javascript'],
  //           content: [
  //             {
  //               type: type,
  //               params: ['name', 'type'],
  //               content: []
  //             }
  //           ]
  //         })

  //         function transform () {
  //           return dom.create('div')
  //         }

  //         javascript().changelog.createHeaderDom(selection, transform).should.eql(
  //           dom.create('span').class('qm-changelog-javascript-header')
  //             .add(dom.create('span').class('qm-changelog-javascript-' + type.replace('?', ''))
  //               .add(dom.create('span').class('qm-changelog-javascript-name').text('name'))
  //               .add(dom.create('span').class('qm-changelog-javascript-type').text('type'))
  //             )
  //         )
  //       })
  //     }

  //     test('property')
  //     test('event')
  //     test('property?')
  //   })
  // })
})

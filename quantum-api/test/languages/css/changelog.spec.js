describe('changelog', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const css = require('../../../lib/languages/css')

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
    testExample('examples/childclass-basic.um')
    testExample('examples/childclass-nested.um')
    testExample('examples/extraclass-basic.um')
    testExample('examples/extraclass-nested.um')
  })

  // describe('createHeaderDom', () => {
  //   it('should return undefined if the type is not supported', () => {
  //     const selection = quantum.select({
  //       type: 'header',
  //       params: ['unknown'],
  //       content: []
  //     })

  //     should.not.exist(css().changelog.createHeaderDom(selection, transform))
  //   })

  //   it('should do classes', () => {
  //     const selection = quantum.select({
  //       type: 'header',
  //       params: [],
  //       content: [
  //         {
  //           type: 'class',
  //           params: ['name'],
  //           content: []
  //         }
  //       ]
  //     })

  //     css().changelog.createHeaderDom(selection, transform).should.eql(
  //       dom.create('span')
  //         .class('qm-changelog-css-header')
  //         .add(dom.create('span').class('qm-changelog-css-class').text('name'))
  //     )
  //   })

  //   it('should do extra classes', () => {
  //     const selection = quantum.select({
  //       type: 'header',
  //       params: [],
  //       content: [
  //         {
  //           type: 'extraclass',
  //           params: ['name'],
  //           content: []
  //         }
  //       ]
  //     })

  //     css().changelog.createHeaderDom(selection, transform).should.eql(
  //       dom.create('span')
  //         .class('qm-changelog-css-header')
  //         .add(dom.create('span').class('qm-changelog-css-extraclass').text('name'))
  //     )
  //   })

  //   it('should do nesting', () => {
  //     const selection = quantum.select({
  //       type: 'header',
  //       params: ['class'],
  //       content: [
  //         {
  //           type: 'class',
  //           params: ['name1'],
  //           content: [
  //             {
  //               type: 'class',
  //               params: ['name2'],
  //               content: [
  //                 {
  //                   type: 'extraclass',
  //                   params: ['name3'],
  //                   content: []
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     })

  //     css().changelog.createHeaderDom(selection, transform).should.eql(
  //       dom.create('span')
  //         .class('qm-changelog-css-header')
  //         .add(dom.create('span').class('qm-changelog-css-class').text('name1'))
  //         .add(dom.create('span').class('qm-changelog-css-class').text('name2'))
  //         .add(dom.create('span').class('qm-changelog-css-extraclass').text('name3'))
  //     )
  //   })
  // })
})

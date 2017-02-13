describe('module', () => {
  const api = require('..')

  it('exports the correct things', () => {
    api.should.be.an('object')
    api.should.have.keys([
      'builders',
      'fileTransform',
      'fileTransforms',
      'languages',
      'transforms'
    ])
    api.fileTransform.should.be.a('function')
    api.transforms.should.be.a('function')
  })

  describe('builders', () => {
    const body = require('../lib/entity-transforms/builders/body')
    const header = require('../lib/entity-transforms/builders/header')
    const item = require('../lib/entity-transforms/builders/item')

    const { builders } = api
    it('exports the correct things', () => {
      builders.should.be.an('object')
      builders.should.have.keys([
        'body',
        'header',
        'item'
      ])
      builders.body.should.be.an('object')
      builders.body.should.equal(body)
      builders.header.should.be.a('function')
      builders.header.should.equal(header)
      builders.item.should.be.a('function')
      builders.item.should.equal(item)
    })
  })

  describe('fileTransforms', () => {
    const changelog = require('../lib/file-transforms/changelog')
    const { fileTransforms } = api
    it('exports the correct things', () => {
      fileTransforms.should.be.an('object')
      fileTransforms.should.have.keys(['changelog'])
      fileTransforms.changelog.should.be.an('object')
      fileTransforms.changelog.should.equal(changelog)
    })
  })

  describe('languages', () => {
    const { languages } = api
    it('exports the correct things', () => {
      languages.should.be.an('object')
      languages.should.have.keys([
        'css',
        'javascript',
        'quantum'
      ])
      languages.css.should.be.a('function')
      languages.javascript.should.be.a('function')
      languages.quantum.should.be.a('function')
    })
  })

  // it('should do nothing when options.processChangelogs is false', () => {
  //   const file = new quantum.File({
  //     info: new quantum.FileInfo({
  //       src: 'src/content/a1.um',
  //       resolved: 'a1.um',
  //       base: 'src/content',
  //       dest: 'target/a1.um',
  //       watch: true
  //     }),
  //     content: {
  //       type: '',
  //       params: [],
  //       content: [
  //         {
  //           type: 'changelogList',
  //           params: [],
  //           content: []
  //         }
  //       ]
  //     }
  //   })
  //   api.fileTransform({processChangelogs: false})(file).should.eql(file)
  // })
})

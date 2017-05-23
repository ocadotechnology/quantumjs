describe('module', () => {
  const api = require('..')

  it('exports the correct things', () => {
    api.should.be.an('object')
    api.should.have.keys([
      'builders',
      'fileTransform',
      'fileTransforms',
      'languages',
      'entityTransforms'
    ])
    api.fileTransform.should.be.a('function')
    api.entityTransforms.should.be.a('function')
  })

  describe('builders', () => {
    const body = require('../lib/entity-transforms/builders/body')
    const header = require('../lib/entity-transforms/builders/header')
    const item = require('../lib/entity-transforms/builders/item')
    const itemGroup = require('../lib/entity-transforms/builders/item-group')

    const { builders } = api
    it('exports the correct things', () => {
      builders.should.be.an('object')
      builders.should.have.keys([
        'body',
        'header',
        'item',
        'itemGroup'
      ])
      builders.body.should.be.an('object')
      builders.body.should.equal(body)
      builders.header.should.be.a('function')
      builders.header.should.equal(header)
      builders.item.should.be.a('function')
      builders.item.should.equal(item)
      builders.itemGroup.should.be.a('function')
      builders.itemGroup.should.equal(itemGroup)
    })
  })

  describe('fileTransforms', () => {
    const changelogFileTransform = require('../lib/file-transforms/changelog').fileTransform
    const { fileTransforms } = api
    it('exports the correct things', () => {
      fileTransforms.should.be.an('object')
      fileTransforms.should.have.keys(['changelog'])
      fileTransforms.changelog.should.be.a('function')
      fileTransforms.changelog.should.equal(changelogFileTransform)
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
})

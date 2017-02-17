'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const dom = require('..')

chai.use(chaiAsPromised)
chai.should()

describe('quantum-dom', () => {
  it('exports the correct things', () => {
    dom.should.be.an('object')
    dom.should.have.keys([
      'Element',
      'TextNode',
      'HeadWrapper',
      'PageModifier',
      'Asset',
      'asset',
      'bodyClassed',
      'create',
      'escapeHTML',
      'head',
      'randomId',
      'stringify',
      'textNode'
    ])
    dom.asset.should.be.a('function')
    dom.bodyClassed.should.be.a('function')
    dom.create.should.be.a('function')
    dom.Element.should.be.a('function')
    dom.escapeHTML.should.be.a('function')
    dom.head.should.be.a('function')
    dom.randomId.should.be.a('function')
    dom.stringify.should.be.a('function')
    dom.textNode.should.be.a('function')
  })

  require('./asset.spec')
  require('./bodyClassed.spec')
  require('./create.spec')
  require('./Element.spec')
  require('./escapeHTML.spec')
  require('./head.spec')
  require('./randomId.spec')
  require('./stringify.spec')
  require('./textNode.spec')
})

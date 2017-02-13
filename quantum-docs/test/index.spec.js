'use strict'

const chai = require('chai')
const docs = require('..')

chai.should()

describe('quantum-docs', () => {
  it('exports the correct things', () => {
    docs.should.be.an('object')
    docs.should.have.keys(['fileTransform', 'transforms'])
    docs.fileTransform.should.be.a('function')
    docs.transforms.should.be.a('function')
  })

  require('./fileTransform.spec')
  require('./transforms.spec')
})

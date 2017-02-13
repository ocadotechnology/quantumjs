'use strict'

const chai = require('chai')
const markdown = require('..')

chai.should()

describe('quantum-markdown', () => {
  it('exports the correct things', () => {
    markdown.should.be.an('object')
    markdown.should.have.keys(['transforms'])
    markdown.transforms.should.be.a('function')
  })

  require('./transforms.spec')
})

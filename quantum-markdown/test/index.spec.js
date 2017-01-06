'use strict'

const chai = require('chai')
const markdown = require('..')

chai.should()

describe('quantum-markdown', () => {
  it('should export the correct things', () => {
    markdown.should.be.an('object')
    markdown.transforms.should.be.a('function')
  })
})

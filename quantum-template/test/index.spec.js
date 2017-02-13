'use strict'

const chai = require('chai')
const template = require('..')

chai.should()

describe('quantum-template', () => {
  it('exports the correct things', () => {
    template.should.be.an('object')
    template.should.have.keys(['fileTransform', 'wrapper'])
    template.fileTransform.should.be.a('function')
    template.wrapper.should.be.a('function')
  })

  require('./fileTransform.spec.js')
  require('./wrapper.spec.js')
})

'use strict'

const chai = require('chai')
const diagram = require('..')

chai.should()

describe('quantum-diagram', () => {
  it('exports the correct things', () => {
    diagram.should.be.an('object')
    diagram.should.have.keys(['transforms'])
    diagram.transforms.should.be.a('function')
  })

  require('./transforms.spec')
})

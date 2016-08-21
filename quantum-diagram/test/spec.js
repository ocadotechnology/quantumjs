const chai = require('chai')
const should = chai.should()
const diagram = require('..')

describe('diagram', () => {
  it('should be a function', () => {
    diagram.should.be.a.function
  })
})

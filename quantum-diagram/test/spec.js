const chai = require('chai')
const diagram = require('..')

chai.should()

describe('diagram', () => {
  it('should be a function', () => {
    diagram.should.be.a.function
  })
})

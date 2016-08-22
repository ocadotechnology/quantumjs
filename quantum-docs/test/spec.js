const chai = require('chai')
const docs = require('..')

chai.should()

describe('docs', () => {
  it('should be a function', () => {
    docs.should.be.a.function
  })
})

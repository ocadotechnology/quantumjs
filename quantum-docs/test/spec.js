const chai = require('chai')
const should = chai.should()
const docs = require('..')

describe('docs', () => {
  it('should be a function', () => {
    docs.should.be.a.function
  })
})

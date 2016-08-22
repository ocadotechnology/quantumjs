const chai = require('chai')
const api = require('..')

chai.should()

describe('api', () => {
  it('should be a function', () => {
    api.should.be.a.function
  })
})

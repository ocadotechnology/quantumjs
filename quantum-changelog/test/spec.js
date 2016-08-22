const chai = require('chai')
const changelog = require('..')

chai.should()

describe('changelog', () => {
  it('should be a function', () => {
    changelog.should.be.a.function
  })
})

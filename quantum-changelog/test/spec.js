const chai = require('chai')
const should = chai.should()
const changelog = require('..')

describe('changelog', () => {
  it('should be a function', () => {
    changelog.should.be.a.function
  })
})

require('chai').should()
const docs = require('..')

describe('docs', () => {
  it('should export the correct things', () => {
    docs.should.be.a.function
    docs.transforms.should.be.a.function
  })
})

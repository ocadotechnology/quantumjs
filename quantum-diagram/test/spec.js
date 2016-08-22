'use-strict'
require('chai').should()
const diagram = require('..')

describe('diagram', () => {
  it('should export the correct things', () => {
    diagram.should.be.an.object
    diagram.transforms.should.be.a.function
  })
})

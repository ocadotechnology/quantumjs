'use strict'
require('chai').should()
const diagram = require('../')

describe('pipeline', () => {
  it('should export the correct things', () => {
    diagram.should.be.an.object
    diagram.transforms.should.be.a.function
  })
})

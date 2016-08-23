'use strict'
require('chai').should()
const api = require('..')

describe('pipeline', () => {
  it('should export the correct things', () => {
    api.should.be.an.object
    api.transforms.should.be.a.function
  })
})

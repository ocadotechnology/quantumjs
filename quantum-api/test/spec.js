'use strict'
require('chai').should()
const api = require('..')

describe('api', () => {
  it('should export the correct things', () => {
    api.should.be.an.object
    api.transforms.should.be.a.function
  })
})

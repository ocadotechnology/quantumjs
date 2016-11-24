'use strict'
require('chai').should()
const codeHighlight = require('..')

describe('pipeline', () => {
  it('should export the correct things', () => {
    codeHighlight.should.be.an.object
    codeHighlight.transforms.should.be.a.function
  })
})

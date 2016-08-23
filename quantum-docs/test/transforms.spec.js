'use strict'
require('chai').should()
const docs = require('..').transforms

describe('transforms', () => {
  it('placeholder', () => {
    docs.should.be.a.function
  })
})

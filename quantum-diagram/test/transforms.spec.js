'use strict'
require('chai').should()
const diagram = require('..').transforms

describe('transforms', () => {
  it('placeholder', () => {
    diagram.should.be.a.function
  })
})

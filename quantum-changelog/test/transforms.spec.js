'use strict'
require('chai').should()
const changelog = require('..').transforms

describe('transforms', () => {
  it('placeholder', () => {
    changelog.should.be.a.function
  })
})

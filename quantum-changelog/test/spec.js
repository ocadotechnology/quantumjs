'use strict'

const chai = require('chai')
const changelog = require('..')

chai.should()

describe('module', () => {
  it('should export the correct things', () => {
    changelog.should.be.a.function
    changelog.transforms.should.be.a.function
  })
})

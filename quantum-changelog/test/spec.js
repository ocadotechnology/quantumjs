'use strict'
const chai = require('chai')
const changelog = require('..')
const path = require('path')

chai.should()

describe('changelog', () => {
  it('should export the correct things', () => {
    changelog.assets.should.eql({
      'quantum-changelog.css': path.join(__dirname, '../assets/quantum-changelog.css'),
      'quantum-changelog.js': path.join(__dirname, '../assets/quantum-changelog.js')
    })
    changelog.should.be.a.function
    changelog.transforms.should.be.a.function
  })
})

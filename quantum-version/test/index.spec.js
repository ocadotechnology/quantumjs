'use strict'

const chai = require('chai')
const version = require('..')

chai.should()

describe('quantum-version', () => {
  it('exports the correct things', () => {
    version.should.be.an('object')
    version.should.have.keys([
      'fileTransform',
      'processTags',
      'processVersioned',
      'processVersionLists'
    ])
    version.fileTransform.should.be.a('function')
    version.processTags.should.be.a('function')
    version.processVersioned.should.be.a('function')
    version.processVersionLists.should.be.a('function')
  })

  require('./defaultFilenameModifier.spec')
  require('./fileTransform.spec')
  require('./mostRecentVersion.spec')
  require('./resolveOptions.spec')
})
